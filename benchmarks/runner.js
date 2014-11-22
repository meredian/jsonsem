var _ = require('lodash');
var Benchmark = require('benchmark');

console.log("Benchmarking jsonsem");

[
    './validation',
    './instantiation'
].forEach(function(benchPath) {
    var benchDescription = require(benchPath);
    var suite = new Benchmark.Suite()
    .on('start', function(event) {
        console.log(benchDescription.name);
    })
    .on('cycle', function(event) {
        console.log(String(event.target));
    })
    .on('complete', function() {
        console.log();
    });

    _.each(benchDescription.cases, function(fn, name) {
        suite.add(name, fn);
    });

    suite.run({async: false});
});
