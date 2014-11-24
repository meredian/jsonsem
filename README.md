jsonsem
=======

Extendable validator for sematicaly structured JSON. When schema is not enought.

Beta for now, but already used in production. See `test/samples` folder for usage samples. A bit verbose, but looks much better in CoffeeScript.

#### Current features:

* Key type validation
* JSON structured object reference validation
* Keys and optional keys presence validation for objects, indexes for array
* Custom types definitions
* Key name reference validation
* Custom functional assertions if everything's really complicated
* Custom property/index conditions

#### Future plans:

* Object relative cross-references
* "Key exists" assertion for objects and arrays
* Extra schema formats, except js - JSON, possibly YAML

MIT Licence.
