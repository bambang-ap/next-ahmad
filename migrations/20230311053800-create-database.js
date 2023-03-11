'use strict';
/** @type {import('sequelize-cli').Migration} */
const {TABLES} = require('../src/constants/enum');

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable(TABLES.USER, {
			id: {
				allowNull: false,
				primaryKey: true,
				type: Sequelize.STRING,
			},
			email: Sequelize.STRING,
			name: Sequelize.STRING,
			role: Sequelize.STRING,
			password: Sequelize.STRING,
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable(TABLES.USER);
	},
};
