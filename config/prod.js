const { DB_NAME, DB_USER_NAME, DB_USER_PASSWORD } = process.env

module.exports = {
  dbURL: `mongodb+srv://${DB_USER_NAME}:${DB_USER_PASSWORD}@cluster0.xytksdp.mongodb.net/?retryWrites=true&w=majority`,
  dbName: DB_NAME
}