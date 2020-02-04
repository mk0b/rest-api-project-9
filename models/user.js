//users model
const Sequelize = require('sequelize');

//TODO: Add validation later with custom validation messages?

module.exports = (sequelize) => {
    class User extends Sequelize.Model {}
        User.init({
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            firstName: {
                type: Sequelize.STRING,
                allowNull: false
            },
            lastName: {
                type: Sequelize.STRING,
                allowNull: false
            },
            emailAddress: {
                type: Sequelize.STRING,
                allowNull: false
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false
            }
        }, { sequelize });

        User.associate = (models) => {
            User.hasMany(models.Course, {
                as: 'User',
                foreignKey: {
                    fieldName: 'userId',
                    allowNull: false
                }
            });
        };

    return User;
};