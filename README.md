# JsonOnRelations
Json-on-Relations try to bundle the merits from both JSON and relational structures. 
Nowadays, JSON is the de-facto standard for data communication. 
Comparing to other data format standards, it is easier to compose and more human readable.

Relational database is still very strong, and no one can replace it so far. 
Existing ORM solutions focus too much on "object". 
Ignoring the relational nature of data limits their abilities on building real-world applications. 
SQL is still proven to be the best abstraction of data manipulation. 
Any attempts to rebuild the wheel always end with ignorant. 

The only meaningful work should be done is to connect JSON with SQL in some *domain specific areas*. 
Json-on-Relations targets to Line-of-Business applications(like ERP, CRM, and HRM), 
and tries to simplify the development by eliminating pipeline coding.

## First Glance
### Define Your Entity
Entity "person" is defined with 4 attributes and 4 roles.  
![Entity: person](EntityPerson.png)

A person can be an employee, thus it has the role "employee". Role "employee" has a relation "r_employee".
![Role: employee](RoleEmployee.png)

A relation corresponds to a DB table which represents a collection of attributes. 
![Relation: r_employee](RelationEmployee.png)

Entities can have relationships with each others. Each relationship is performed by certain roles. 
For example, relationship "marriage" is performed by 2 roles: "husband" and "wife". 
Once the 2 roles are respectively assigned to 2 people, they can then potentially have the marriage relationship.  
![Relation: r_employee](RelationshipMarriage.png)

### Browse and Maintain Your Entity Instances
Once you have the data modelling done, you can immediately create a person instance.  
![A person instance](PersonInstance.png)

You can also search instances of different entity types based on all their available attributes from relations and relationships. 
![Instance Search and List](InstanceList.png)

### Compose Your Message
Each entity instance can be represented as a JSON file. 
And the JSON is not just an simple format, but also a message that can be communicated with the server end. 
![JSON format of a person instance](JSONPersonInstance.png)

If you want to create a new person instance, just post the message like bellow:
```http request
POST http://localhost:3001/api/entity
Accept: */*
Cache-Control: no-cache
Content-Type: application/json

    { "ENTITY_ID": "person",
      "person": {"HEIGHT": "170", "GENDER": "male", "FINGER_PRINT": "CA67DE15727C72961EB4B6B59B76743E", "HOBBY":"Reading, Movie, Coding"},
      "r_employee": {"USER_ID": "DH001", "COMPANY_ID":"Darkhouse", "DEPARTMENT_ID": "Development", "TITLE": "Developer", "GENDER":"Male"},
      "r_address": [
         {"COUNTRY": "China", "CITY":"Shanghai", "POSTCODE": "999999",
          "ADDRESS_VALUE":"Room #999, Building #99, XXXX Road #999',
          "TYPE": "Current Live", "PRIMARY":1},
         {"COUNTRY": "China", "CITY":"Seasaw", "POSTCODE": "888888",
          "ADDRESS_VALUE" : "West Valley Lake",
          "TYPE": "Born Place", "PRIMARY":0}],
      relationships:[ ]
    }
```  

If you want to change the TITLE of an employee(person) from "Developer" to "Architect", then:
```http request
PUT http://localhost:3001/api/entity
Accept: */*
Cache-Control: no-cache
Content-Type: application/json

    { "ENTITY_ID": "person",
      "INSTANCE_GUID": "2FBE7490E10F11E8A90957FA46F2CECA",
      "r_employee": {"action": "update", "USER_ID": "DH001", "TITLE": "Architect"},
    }
```  

Want to add a new address? just do it in this way:
```http request
PUT http://localhost:3001/api/entity
Accept: */*
Cache-Control: no-cache
Content-Type: application/json

    { "ENTITY_ID": "person",
      "INSTANCE_GUID": "2FBE7490E10F11E8A90957FA46F2CECA",
      "r_address": [
         {"action": "add", "COUNTRY": "China", "CITY":"Shanghai", "POSTCODE": "777777",
          "ADDRESS_VALUE":"Building #909, YYYY Road #101',
          "TYPE": "Office", "PRIMARY":0}
          ]
    }
```  

## Concept Behind
An entity is a "thing" which can be distinctly identified. A specific person, company, or event is an example of an entity. 
A relationship is an association among entities. For instance, "marriage" is a relationship between two "person" entities.

Details are illustrated in following diagram:
![Meta Data Model](DataModeling.png)

An Entity can have multiple direct attributes, 
as well as indirect attributes from the roles that are assigned to it. 
Roles don't have attributes directly, but are inherit from the relations assigned to them.

A relation corresponds to a DB table, and its attributes are fields of the table.
In this scenes, a entity itself is also a kind of relation. 

Roles perform relationships. Once roles are assigned to entities, 
those relationships thus can be applied to the entities. 
And the relationship instances are actually the associations among entities.
Relationship itself is a kind of relation which can also have direct attributes. 

To achieve re-usability and context consistency, the meta of an attribute can be defined as data elements and data domains.
data domain is used to boundary the value type and range of an attribute, 
while a data element can be assigned with a data domain, and adding more business semantics like labels, documentations, and so on. 

## License
[The MIT License](http://opensource.org/licenses/MIT)

