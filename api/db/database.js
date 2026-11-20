const fs = require('fs');
const path = require('path');
const { neon } = require("@neondatabase/serverless");
const logger = require("../utils/logger");
require("dotenv").config();

const LOCAL_STORE_PATH = path.join(__dirname, 'local_db.json');

let localData = {
    favorites: [],
    search_history: [],
    users: []
};

// Load existing local data if present
try {
    if (fs.existsSync(LOCAL_STORE_PATH)) {
        localData = JSON.parse(fs.readFileSync(LOCAL_STORE_PATH, 'utf-8'));
    }
} catch (e) {
    // Ignore corrupt local storage
}

const saveLocalData = () => {
    try {
        fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(localData, null, 2), 'utf-8');
    } catch (e) {}
};

// Local Tagged Template Mock Driver
const localDb = async (strings, ...values) => {
    const rawSql = strings.reduce((acc, str, i) => acc + str + (values[i] !== undefined ? values[i] : ''), '').trim();
    const query = strings.join('?').trim();
    
    // 1. SELECT favorites
    if (/SELECT\s+.*?\s+FROM\s+favorites/is.test(query)) {
        let results = [...localData.favorites];
        // Check if filtering by user_id
        if (/user_id\s*=\s*\?/is.test(query) || /user_id\s*=/is.test(query)) {
            let userId = values.find(v => typeof v === 'string' && (v.includes('-') || v.startsWith('user-')));
            if (!userId) {
                const match = rawSql.match(/user_id\s*=\s*['"]?([a-zA-Z0-9_-]+)['"]?/i);
                if (match) userId = match[1];
            }
            if (userId) {
                results = results.filter(f => f.user_id === userId);
            }
        }
        // Check if filtering by city
        if (/LOWER\(city\)\s*=\s*LOWER\(\?\)/is.test(query) || /LOWER\(city\)\s*=/is.test(query)) {
            let cityVal = values.find(v => typeof v === 'string' && !v.includes('-') && !v.startsWith('user-'));
            if (!cityVal) {
                const match = rawSql.match(/LOWER\(city\)\s*=\s*LOWER\(['"]?([^'")]+)['"]?\)/i);
                if (match) cityVal = match[1];
            }
            if (cityVal) {
                results = results.filter(f => f.city.toLowerCase() === cityVal.toLowerCase());
            }
        }
        return results.map(f => ({
            id: f.id,
            city: f.city,
            added_at: f.added_at,
            addedAt: f.added_at
        }));
    }

    // 2. INSERT INTO favorites
    if (/INSERT\s+INTO\s+favorites/is.test(query)) {
        let userId = 'default-user';
        let city = '';
        for (const val of values) {
            if (typeof val === 'string') {
                if (val.includes('-') || val.startsWith('user-')) userId = val;
                else city = val;
            }
        }
        if (!city) {
            const match = rawSql.match(/VALUES\s*\([^,]+,\s*['"]?([^'")]*)['"]?\)/i);
            if (match) city = match[1].trim();
        }
        if (!city) city = 'Unknown';

        const existingIdx = localData.favorites.findIndex(f => f.city.toLowerCase() === city.toLowerCase() && f.user_id === userId);
        const newFav = {
            id: Date.now().toString(),
            user_id: userId,
            city: city,
            added_at: new Date().toISOString()
        };
        if (existingIdx >= 0) {
            localData.favorites[existingIdx] = newFav;
        } else {
            localData.favorites.unshift(newFav);
        }
        saveLocalData();
        return [{ city: newFav.city, addedAt: newFav.added_at, added_at: newFav.added_at }];
    }

    // 3. DELETE FROM favorites
    if (/DELETE\s+FROM\s+favorites/is.test(query)) {
        let city = '';
        let userId = '';
        for (const val of values) {
            if (typeof val === 'string') {
                if (val.includes('-') || val.startsWith('user-')) userId = val;
                else city = val;
            }
        }
        if (!city) {
            const match = rawSql.match(/LOWER\(city\)\s*=\s*LOWER\(['"]?([^'")]+)['"]?\)/i);
            if (match) city = match[1].trim();
        }
        if (city) {
            localData.favorites = localData.favorites.filter(f => {
                if (f.city.toLowerCase() !== city.toLowerCase()) return true;
                if (userId && f.user_id !== userId) return true;
                return false;
            });
            saveLocalData();
        }
        return [];
    }

    // 4. SELECT search_history
    if (/SELECT\s+.*?\s+FROM\s+search_history/is.test(query)) {
        let results = [...localData.search_history];
        if (values.length > 0 && /user_id/is.test(query)) {
            const userId = values[0];
            results = results.filter(h => !h.user_id || h.user_id === userId);
        }
        const cityMap = new Map();
        for (const item of results) {
            const existing = cityMap.get(item.city);
            if (!existing || new Date(item.searched_at) > new Date(existing)) {
                cityMap.set(item.city, item.searched_at);
            }
        }
        const grouped = Array.from(cityMap.entries()).map(([city, searchedAt]) => ({
            city,
            searchedAt
        })).sort((a, b) => new Date(b.searchedAt) - new Date(a.searchedAt)).slice(0, 10);
        return grouped;
    }

    // 5. INSERT INTO search_history
    if (/INSERT\s+INTO\s+search_history/is.test(query)) {
        let city = values.find(v => typeof v === 'string' && !v.includes('-') && !v.startsWith('user-')) || values[values.length - 1];
        let userId = values.find(v => typeof v === 'string' && (v.includes('-') || v.startsWith('user-'))) || null;
        if (!city) {
            const match = rawSql.match(/VALUES\s*\([^)]*['"]([^'"]+)['"][^)]*\)/i);
            if (match) city = match[1].trim();
        }
        if (city) {
            localData.search_history.unshift({
                id: Date.now().toString(),
                user_id: userId,
                city,
                searched_at: new Date().toISOString()
            });
            if (localData.search_history.length > 50) localData.search_history.length = 50;
            saveLocalData();
        }
        return [];
    }

    // Default for any other query
    return [];
};

let sql = null;
let warnedFallback = false;

const getDb = () => {
    if (!sql) {
        if (!process.env.DATABASE_URL) {
            return localDb;
        }
        try {
            sql = neon(process.env.DATABASE_URL);
        } catch (error) {
            logger.warn("Using local in-memory fallback database");
            return localDb;
        }
    }
    return sql;
};

// Wrapper function to execute queries with error handling & offline fallback
const executeQuery = async (queryFn) => {
    try {
        const db = getDb();
        return await queryFn(db);
    } catch (error) {
        if (!warnedFallback) {
            logger.warn("Primary database connection failed. Falling back to local offline storage.");
            warnedFallback = true;
        }
        try {
            return await queryFn(localDb);
        } catch (fallbackError) {
            return [];
        }
    }
};

module.exports = {
    getDb,
    executeQuery,
    localDb
};
