'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'TokenGatedContents',
    [
      {
        tokenAddress:  "0x86d75abe8e4d078380e8d335edcd7c86c623b4fc",
        tokenId : "0",
        balanceRequired: "1",
        contentRoute: "./content/photo-1453728013993-6d66e9c9123a.jpeg",
        contentName: "0x86d75abe8e4d078380e8d335edcd7c86c623b4fc_0",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    {},
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('TokenGatedContents', null, {}),
};
