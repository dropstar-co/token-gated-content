'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TokenGatedContent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TokenGatedContent.init({
    tokenAddress: DataTypes.STRING,
    tokenId: DataTypes.STRING,
    balanceRequired: DataTypes.STRING,
    contentRoute: DataTypes.STRING,
    contentName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'TokenGatedContent',
    tableName: 'TokenGatedContents',
  });
  return TokenGatedContent;
};