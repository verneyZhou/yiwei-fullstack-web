const connection = require('../sql/index');

class UserService {
    
    async getUserTable() {
        const statement = `SELECT * FROM admin.user_table;`;
        const [result] = await connection.execute(statement);
        return result;
    }
}


module.exports = new UserService();