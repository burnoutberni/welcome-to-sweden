const Person = require('./person.js');
const Position = require('./position.js');

var position1 = Position(5.000000, 4.00000);
var languages1 = ["English", "Swedish"];

var position2 = Position(5.200000, 4.00000);
var languages2 = ["English", "French"];

var swede1 = Person("Markus", "Nilsson", position1, languages1);

var immigrant1 = Person("Vincent", "Martin", position2, languages2);

