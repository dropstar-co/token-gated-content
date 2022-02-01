'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TokenGatedContents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tokenAddress: {
        type: Sequelize.STRING
      },
      tokenId: {
        type: Sequelize.STRING
      },
      balanceRequired: {
        type: Sequelize.STRING
      },
      contentRoute: {
        type: Sequelize.STRING
      },
      contentName: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('TokenGatedContents');
  }
};