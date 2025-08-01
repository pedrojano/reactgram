const mongoose =require("mongoose");
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

const conn = async () =>  {
    try {
        const dbConn = await mongoose.connect(
            `mongodb+srv://${dbUser}:${dbPassword}@cluster0.vvar3rg.mongodb.net/`
        );

        console.log("conectou o banco!");

        return dbConn;

    } catch (error){
        console.log(error);
    };
}

conn()

module.exports = conn;
