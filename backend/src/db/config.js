const config = {
    getConnectionString: () => {
        if (process.env.NODE_ENV === 'production') {
            return process.env.MONGO_URI;
        }
        return 'mongodb://localhost:27017/bruutube';
    },
    
    getDBName: () => {
        if (process.env.NODE_ENV === 'production') {
            return process.env.DB_NAME;
        }
        return 'bruutube';
    }
};

export default config;