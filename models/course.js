//courses model
const Sequelize = require('sequelize');

//TODO: Rename the foreign key? to lowercase u in userId

module.exports = (sequelize) => {
    class Course extends Sequelize.Model {}
        Course.init({
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            estimatedTime: {
                type: Sequelize.STRING
            },
            materialsNeeded: {
                type: Sequelize.STRING
            }
        }, { sequelize });

        Course.associate = (models) => {
            Course.belongsTo(models.User, {
                foreignKey: {
                    fieldName: 'userId',
                    allowNull: false
                }
            });
        };

    return Course;
};