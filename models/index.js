var Sequelize = require('sequelize');
var db = new Sequelize('postgres://localhost:5432/wikistack', {
	logging: false
});

var Page = db.define('page', {
	title: {
		type: Sequelize.STRING, 
		allowNull: false
	},
	urlTitle: {
		type: Sequelize.STRING,
		allowNull: false 
	},
	content: {
		type: Sequelize.TEXT, 
		allowNull: false
	},
	date: {
		type: Sequelize.DATE,
		defaultValue: Sequelize.NOW
	},
	status: {
		type: Sequelize.ENUM('open','closed'),
		defaultValue: 'closed'
	},
	tags: {
		type: Sequelize.ARRAY(Sequelize.STRING)  
	}
}, {
	hooks: {
		beforeValidate: function(page, options){

			function generateUrlTitle (title) {
			  	if (title) {
			    // Removes all non-alphanumeric characters from title
			    // And make whitespace underscore
			    return title.replace(/\s+/g, '_').replace(/\W/g, '');
			  } else {
			    // Generates random 5 letter string
			    return Math.random().toString(36).substring(2, 7);
			  }
			}

			page.urlTitle = generateUrlTitle(page.title);
		}
	},
	route: {
		type: Sequelize.VIRTUAL,
		get: function(){
			return "/wiki/" + this.getDataValue('urlTitle');
		}
	}
}
);

// Page.hook('beforeValidate', function(page, options){
// 				var generateUrl = function(title){
// 				if ((/\W+/g).test(title)) return title.replace(/\W+/g, "_");
// 				return Math.random().toString(36).substring(7);
// 			}

// 			page.urlTitle = generateUrl(page.title)
// });

var User = db.define('user', {
	name: {
		type: Sequelize.STRING, 
		allowNull: false
	},
	email: {
		type: Sequelize.STRING,
		validate:{
			isEmail: true
		}, 
		allowNull: false
	}
});

Page.belongsTo(User, { as: 'author' });


module.exports = {
	Page: Page,
	User: User
};