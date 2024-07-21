const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: 'environment/.env' });

mongoose.set('strictQuery', true);

async function run() {
    try {
        const database = process.env.DATABASE_CONNECTIONSTRING.replace('<password>', process.env.DATABASE_PASSWORD);
        console.log('Connecting to database:', database);

        // Chỉ sử dụng cấu hình mặc định
        const configDB = {
            user: process.env.DATABASE_USERNAME,
            pass: process.env.DATABASE_PASSWORD,
            authSource: 'admin',
        };

        // Connect to the database
        await mongoose.connect(database, configDB);
        console.log('DB connection successful!');
    } catch (error) {
        console.error('DB connection failed!', error);
    }
}

run();
