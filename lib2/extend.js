module.exports = function(base, sub) {
    var surrogateCtor = function() {};
    surrogateCtor.prototype = base.prototype;
    sub.prototype = new surrogateCtor();
    sub.prototype.constructor = sub;
    sub.base = base.prototype;
    return sub;
};

// var Dog = function(name) {
//     Dog.base.constructor.call(this, name);
// };

// extend(Animal, Dog);

// Dop.prototype.test = function(){};
