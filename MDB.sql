-- MySQL dump 10.13  Distrib 5.6.20, for osx10.8 (x86_64)
--
-- Host: 127.0.0.1    Database: MDB
-- ------------------------------------------------------
-- Server version	5.6.20

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ATTRIBUTE`
--

DROP TABLE IF EXISTS `ATTRIBUTE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ATTRIBUTE` (
  `ATTR_GUID` varchar(32) NOT NULL COMMENT 'Extension GUID',
  `RELATION_ID` varchar(32) NOT NULL COMMENT 'Entity/Relationship/Role ID',
  `ATTR_NAME` varchar(60) NOT NULL COMMENT 'Attribute Technique Name. Which can also be uniquely identify the attribute under the entity/relationship.',
  `ATTR_DESC` varchar(256) DEFAULT NULL COMMENT 'Attribute description',
  `DATA_ELEMENT` varchar(45) DEFAULT NULL,
  `DATA_TYPE` int(4) DEFAULT NULL COMMENT 'The data type of the extension field:1: CHAR, 2: INT(4), 3: DOUBLE, 4: FLOAT, 5:STRING, 6:XSTRING, 7:BIN, 8:DATE, 9:TIMESTAMP, 10: Boolean, 11:Multi-Value',
  `DATA_LENGTH` int(4) DEFAULT NULL COMMENT 'The data length of the extension field',
  `DECIMAL` int(2) DEFAULT NULL,
  `ORDER` int(4) DEFAULT '0',
  `PRIMARY_KEY` tinyint(1) DEFAULT NULL,
  `AUTO_INCREMENT` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`ATTR_GUID`),
  KEY `01` (`RELATION_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Extension Fields'' meta data.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ATTRIBUTE`
--

LOCK TABLES `ATTRIBUTE` WRITE;
/*!40000 ALTER TABLE `ATTRIBUTE` DISABLE KEYS */;
INSERT INTO `ATTRIBUTE` VALUES ('01530840E9A311E88B4283607937C195','r_test001','FIELD3',NULL,NULL,3,0,0,0,0,0),('02C2EE9D3CA229EAD8919007CC3858C','r_user','GIVEN_NAME','Given Name','GIVEN_NAME',1,64,NULL,4,NULL,NULL),('0812F1F6AC5C42078E1F66DD9F6F207E','r_role','NAME','Role Name','ROLE_NAME',1,64,NULL,1,1,NULL),('0A80CD505DC311E9BC3DE104595EF532','rs_marriage','VALID_FROM','Valid from','',8,NULL,NULL,11,0,0),('0A80CD515DC311E9BC3DE104595EF532','rs_marriage','VALID_TO','Valid to','',8,NULL,NULL,12,0,0),('10F62E043562EC6E2373E743F606EB2F','person','HOBBY','Hobbies','HOBBY',1,60,NULL,3,NULL,0),('13976E0B39AEBAFBDC35764518DB72D9','person','HEIGHT','Height','HEIGHT',2,NULL,NULL,2,NULL,0),('167916A05DBC11E9929E67A69E53053F','rs_marriage','husband_INSTANCE_GUID','Entity Instance GUID of role husband','',1,32,NULL,6,0,0),('167916A15DBC11E9929E67A69E53053F','rs_marriage','husband_ENTITY_ID','Entity ID of role husband','',1,32,NULL,7,0,0),('167916A25DBC11E9929E67A69E53053F','rs_marriage','wife_INSTANCE_GUID','Entity Instance GUID of role wife','',1,32,NULL,8,0,0),('167916A35DBC11E9929E67A69E53053F','rs_marriage','wife_ENTITY_ID','Entity ID of role wife','',1,32,NULL,9,0,0),('187E22E02ACE11E99A2D1B6606150BCA','app','NAME','Application Name','APP_NAME',1,64,NULL,1,0,0),('1FE84DA05DC111E9BC3DE104595EF532','rs_blog_comments','VALID_FROM','Valid from','',8,NULL,NULL,1,0,0),('1FE84DA15DC111E9BC3DE104595EF532','rs_blog_comments','VALID_TO','Valid to','',8,NULL,NULL,2,0,0),('1FE84DA25DC111E9BC3DE104595EF532','rs_blog_comments','blog_INSTANCE_GUID','Entity Instance GUID of role blog','',1,32,NULL,3,0,0),('1FE84DA35DC111E9BC3DE104595EF532','rs_blog_comments','blog_ENTITY_ID','Entity ID of role blog','',1,32,NULL,4,0,0),('1FE84DA45DC111E9BC3DE104595EF532','rs_blog_comments','blog_comment_INSTANCE_GUID','Entity Instance GUID of role blog_comment','',1,32,NULL,5,0,0),('1FE84DA55DC111E9BC3DE104595EF532','rs_blog_comments','blog_comment_ENTITY_ID','Entity ID of role blog_comment','',1,32,NULL,6,0,0),('209D3580F3FD11E98F6A9F800EA12272','r_goods','MATERIAL_DESC','Material description','MATERIAL_DESC',1,200,NULL,2,0,NULL),('215398FA901E8696BD093A0E9CBA2C7C','r_address','ADDRESS_ID','Address ID','ADDRESS_ID',2,NULL,NULL,1,1,1),('238549CD9FDA471EBF1FA98CE9E9A702','blog','AUTHOR','Blog Author',NULL,1,64,NULL,1,NULL,0),('24FE9C00E9AD11E8B810DBD032F0ADE0','r_test001','FIELD3',NULL,NULL,3,0,0,0,0,0),('257F84001FE011E99C440BB4C5374517','r_app_category','NAME','Category Name','CATEGORY_NAME',1,120,NULL,1,1,0),('257F84011FE011E99C440BB4C5374517','r_app_category','ICON','Category ICON','',1,64,NULL,2,0,0),('2906CCC06F0211E9B5DAAF32900A09BA','rs_system_role_category','ORDER','Order or sequence no','ORDER',2,NULL,NULL,6,0,NULL),('33976E0B39AEBAFBDC35764518DB72D9','r_test001','FIELD3',NULL,NULL,3,0,2,0,0,0),('378658E8863842AE9CA1DCB448EF6B36','r_role','DESCRIPTION','Medium description is less than 200.','DESCRIPTION_MEDIUM',1,200,NULL,2,0,NULL),('37C7C8C24EBDB3A725FC7D6CF719A06E','r_personalization','DATE_FORMAT','Date format','DATE_FORMAT',1,64,NULL,5,0,NULL),('37FD84D06F0211E9B5DAAF32900A09BA','rs_app_category','ORDER','Order or sequence no','ORDER',2,NULL,NULL,6,0,NULL),('46075A50FB07A981E65E9FAE4BEC1358','r_company','COMPANY_DESC','Medium description is less than 200.','DESCRIPTION_MEDIUM',1,200,NULL,1,NULL,NULL),('464996A0F32811E9AB756F2008E0531B','material','MATERIAL_DESC','Material ID','MATERIAL_DESC',1,40,NULL,0,0,NULL),('464996A1F32811E9AB756F2008E0531B','material','TYPE','Material type','MATERIAL_TYPE',1,10,NULL,1,0,NULL),('464996A2F32811E9AB756F2008E0531B','material','CREATED_BY','The user who created the entity','CREATED_BY',1,10,NULL,2,0,NULL),('464996A3F32811E9AB756F2008E0531B','material','CREATE_TIME','Time when the object is created','CREATE_TIME',8,NULL,NULL,3,0,NULL),('464996A4F32811E9AB756F2008E0531B','material','CHANGED_BY','The user who changed the entity','CHANGED_BY',1,10,NULL,4,0,NULL),('464996A5F32811E9AB756F2008E0531B','material','CHANGE_TIME','Time when an object is changed','CHANGE_TIME',8,NULL,NULL,5,0,NULL),('481ABC9C1697A4CD9A5AA00C6AF5EDD5','blog_c','SUBMIT_TIME',NULL,NULL,4,NULL,NULL,0,NULL,0),('4F67CEB6E97059D2E59614734EA80D12','r_email','PRIMARY','Boolean in general','PRIMARY',3,NULL,NULL,3,0,NULL),('50B8AD3E3460A8AD3A881490CAE1935D','r_user','PWD_STATE','Password state','PWD_STATE',2,NULL,NULL,9,NULL,NULL),('5299ED5694B542DF9FBC9EBDF19D3D15','blog','ID','Blog ID',NULL,2,NULL,NULL,2,NULL,0),('54D87DCF56604EE0B94D736E89A51F68','blog','NUM_READS','Number of Reads',NULL,2,NULL,NULL,3,NULL,0),('5AF806B0F35311E98F6A9F800EA12272','r_goods','CURRENCY_CODE','Currency Code','CURRENCY_CODE',1,3,NULL,4,0,NULL),('5EC22219F4E45746BFCDE76256FD6160','r_employee','COMPANY_ID','Company ID','COMPANY_ID',1,20,NULL,4,0,NULL),('60BD24C5AC9E441E517E2D1D39B66489','blog_c','COMMENT',NULL,NULL,1,256,NULL,0,NULL,0),('6536A71833B54CBE9EF0A95938E9CFC0','blog','PUBLISHED','Is Published',NULL,3,NULL,NULL,4,NULL,0),('65588DB01E5011E986CD5503AC4FFAF2','category','NAME','Category Name','CATEGORY_NAME',1,120,NULL,1,0,0),('68BEC95005C911E9A1D55FBB5A2440AC','rs_marriage','REG_PLACE','Country','ADDRESS',1,256,NULL,3,0,NULL),('68BEF06005C911E9A1D55FBB5A2440AC','rs_marriage','COUNTRY','Country','COUNTRY',1,10,NULL,4,0,NULL),('6BA19EE0F35311E98F6A9F800EA12272','r_order_item','CURRENCY_CODE','Currency Code','CURRENCY_CODE',1,3,NULL,6,0,NULL),('6C357AF2BE7B3FC9D4EB39424D2F541B','person','GENDER','Gender','GENDER',1,10,NULL,1,NULL,0),('6D3AD1C0F32D11E9AB756F2008E0531B','r_retail_customer','CUSTOMER_NO','Customer Number','CUSTOMER_NO',1,30,NULL,1,1,NULL),('6D3AD1C2F32D11E9AB756F2008E0531B','r_retail_customer','EMAIL','Email','EMAIL',1,200,NULL,2,0,NULL),('6D3AD1C3F32D11E9AB756F2008E0531B','r_retail_customer','CELL_PHONE','Cell phone number','CELL_PHONE_NUMBER',1,15,NULL,3,0,NULL),('6E61D5C8DEEEFD29D1117C6735B32082','blog_c','IP_ADDRESS',NULL,NULL,1,15,NULL,0,NULL,0),('6E87AF00F32B11E9AB756F2008E0531B','r_goods','MATERIAL_ID','Material ID','MATERIAL_ID',1,40,NULL,1,1,NULL),('6E87AF01F32B11E9AB756F2008E0531B','r_goods','PRICE','Price','PRICE',4,23,2,3,0,NULL),('6E87AF02F32B11E9AB756F2008E0531B','r_goods','UNIT','Unit','UNIT',1,10,NULL,5,0,NULL),('6EA9A83FA267F82EBE1B381D56A3F312','r_personalization','TIMEZONE','Timezone','TIMEZONE',1,10,NULL,4,0,NULL),('6FE183B97FC0E7578051EBDB9EF5D5A4','r_address','ADDRESS_VALUE','Address','ADDRESS',2,256,NULL,3,0,NULL),('75459020E9AC11E8B2AF4D0EDD25B2C8','r_test001','FIELD3',NULL,NULL,3,0,0,0,0,0),('771EBF50F3FD11E98F6A9F800EA12272','order','REMARK','Description is no length limit','DESCRIPTION_UNLIMIT',5,NULL,NULL,1,0,NULL),('793A63D8DEA43B5BF88EE7BAF02757C4','r_user','USER_NAME','User Name','USER_NAME',1,64,NULL,2,NULL,NULL),('7A0A6B70F32A11E9AB756F2008E0531B','customer','CUSTOMER_NAME','Customer name','CUSTOMER_NAME',1,64,NULL,2,0,NULL),('7B1EB846E932AD839D4ECE7462AD7F3D','r_address','POSTCODE','Postcode','POSTCODE',1,NULL,NULL,4,0,NULL),('82FE8C179A3D832C12AD332044558575','r_user','PASSWORD','Password(Encrypted)','PASSWORD',1,64,NULL,8,NULL,NULL),('849D0D50634137D6E9F9D6F153C67627','r_employee','DEPARTMENT_ID','Department ID','DEPARTMENT_ID',1,20,NULL,5,0,NULL),('8549B2388F8C3E6381CA15043EC4CFAE','r_email','EMAIL','Email','EMAIL',1,320,NULL,1,1,NULL),('874DE1A0CF38C6C4B740E2B68F1E43F6','r_email','TYPE','Email type','EMAIL_TYPE',1,10,NULL,2,0,NULL),('89625B00ED0311E998AB6FE356EBA785','person','BIRTHDAY','Birthday','BIRTHDAY',7,NULL,NULL,2,0,NULL),('8ACE80005DBA11E9929E67A69E53053F','rs_app_category','app_category_INSTANCE_GUID','Entity Instance GUID of role app_category','',1,32,NULL,1,0,0),('8ACE80015DBA11E9929E67A69E53053F','rs_app_category','app_category_ENTITY_ID','Entity ID of role app_category','',1,32,NULL,2,0,0),('8ACE80025DBA11E9929E67A69E53053F','rs_app_category','portal_app_INSTANCE_GUID','Entity Instance GUID of role portal_app','',1,32,NULL,3,0,0),('8ACE80035DBA11E9929E67A69E53053F','rs_app_category','portal_app_ENTITY_ID','Entity ID of role portal_app','',1,32,NULL,4,0,0),('8B7E439841BC1C43238B68C5B05C5051','r_company','COMPANY_ID',NULL,'COMPANY_ID',1,20,NULL,2,1,NULL),('8CDFEDA02BA311E9BD55195C94C6A6A5','app','IS_EXTERNAL','Boolean in general','BOOLEAN',3,NULL,NULL,2,0,0),('90D418F172B221C71D62598C119E97D5','r_user','MIDDLE_NAME','Middle Name','MIDDLE_NAME',1,64,NULL,5,NULL,NULL),('920E3720F34C11E9AF9DED626772E89F','r_order_head','ORDER_NO','Order Number','ORDER_NO',2,NULL,NULL,0,1,NULL),('920E5E30F34C11E9AF9DED626772E89F','r_order_head','SOLD_TO_PARTY','The person or organization who place the order','SOLD_TO_PARTY',1,30,NULL,1,0,NULL),('920E5E31F34C11E9AF9DED626772E89F','r_order_head','SHIP_TO_PARTY','The person or organization who take the stock delivery','SHIP_TO_PARTY',1,30,NULL,2,0,NULL),('920E5E32F34C11E9AF9DED626772E89F','r_order_head','BILL_TO_PARTY','The person or organization who receives the bill','BILL_TO_PARTY',1,30,NULL,3,0,NULL),('920E5E33F34C11E9AF9DED626772E89F','r_order_head','PAY_TO_PARTY','The person or organization who pay the bill. Usually the back, or payment companies.','PAY_TO_PARTY',1,30,NULL,4,0,NULL),('920E5E34F34C11E9AF9DED626772E89F','r_order_head','REMARK','Medium description is less than 200.','DESCRIPTION_MEDIUM',1,200,NULL,5,0,NULL),('929116D53BF779DB2E0AC487971773D4','r_address','TYPE','Address type','ADDRESS_TYPE',1,10,NULL,2,0,NULL),('930EF6C283C8679EE43B291EA5C1A76C','r_address','CITY','City','CITY',1,10,NULL,5,0,NULL),('93CB473FC2C6D2E32BFE5E60E603934D','r_address','COUNTRY','Country','COUNTRY',1,10,NULL,6,0,NULL),('9580ABF1F32811E9AB756F2008E0531B','customer','TYPE','Customer type','CUSTOMER_TYPE',1,10,NULL,1,0,NULL),('9580ABF2F32811E9AB756F2008E0531B','customer','CREATED_BY','The user who created the entity','CREATED_BY',1,10,NULL,2,0,NULL),('9580ABF3F32811E9AB756F2008E0531B','customer','CREATE_TIME','Time when the object is created','CREATE_TIME',8,NULL,NULL,3,0,NULL),('9580ABF4F32811E9AB756F2008E0531B','customer','CHANGED_BY','The user who changed the entity','CHANGED_BY',1,10,NULL,4,0,NULL),('9580ABF5F32811E9AB756F2008E0531B','customer','CHANGE_TIME','Time when an object is changed','CHANGE_TIME',8,NULL,NULL,5,0,NULL),('9718C0E8783C1F86EC212C8436A958C5','r_personalization','DECIMAL_FORMAT','Decimal format','DECIMAL_FORMAT',1,60,NULL,3,0,NULL),('9796A7208A8F11E9B33AE323F41A492C','person','TYPE','Type of a person','PERSON_TYPE',1,10,NULL,8,0,0),('99B95A18333541319DAD743F7FB9BFD1','blog','PUBLISH_TIME','Publish Time',NULL,8,NULL,NULL,5,NULL,0),('9AB0CF119EF2D8CEBBBFA0320CACADD6','r_user','LOCK','Whether the user is locked','USER_LOCK',3,NULL,NULL,7,NULL,NULL),('9B530A701D8411E9988095837A47C01E','app','APP_ID','Application ID','APP_ID',1,32,NULL,3,0,0),('9B5331811D8411E9988095837A47C01E','app','ROUTE_LINK','Portal relative navigation link','ROUTE_LINK',1,120,NULL,4,0,0),('A0C6A5E0E9AC11E8886E517D903B4CD4','r_test001','FIELD3',NULL,NULL,3,0,0,0,0,0),('A2F08640A71311E99FEEC5535E8C2F7B','permission','DESCR','Short description is less than 100 chars','DESCRIPTION_SHORT',1,100,NULL,1,0,0),('A637AD08C5E8A89445982B15C7D83459','rs_user_role','SYNCED',NULL,'BOOLEAN',3,NULL,NULL,1,NULL,NULL),('A9223C40E9AC11E88512858CAC8DC978','r_test001','FIELD3',NULL,NULL,3,0,0,0,0,0),('AB16FF7FA38C46B1B2F9F55A3380FAC5','blog','TITLE','Blog Title',NULL,1,128,NULL,6,NULL,0),('B363CF90F2EB11E9AB756F2008E0531B','r_order_item','ORDER_NO','Order Number','ORDER_NO',2,NULL,NULL,0,1,0),('B363CF91F2EB11E9AB756F2008E0531B','r_order_item','ITEM_NO','Order item number','ORDER_ITEM_NO',2,NULL,NULL,1,1,0),('B363CF92F2EB11E9AB756F2008E0531B','r_order_item','MATERIAL_ID','Material ID','MATERIAL_ID',1,40,NULL,2,0,NULL),('B363CF93F2EB11E9AB756F2008E0531B','r_order_item','QUANTITY','Quantity','QUANTITY',4,23,4,3,0,NULL),('B363CF94F2EB11E9AB756F2008E0531B','r_order_item','UNIT','Unit','UNIT',1,10,NULL,4,0,NULL),('B363CF95F2EB11E9AB756F2008E0531B','r_order_item','PRICE','Price','PRICE',4,23,2,5,0,NULL),('B363CF96F2EB11E9AB756F2008E0531B','r_order_item','REMARK','Medium description is less than 200.','DESCRIPTION_MEDIUM',1,200,NULL,6,0,NULL),('B451CB90F6D011E88A0AB1CA91FA338B','r_comment','COMMENT','Comment Content','',1,256,NULL,1,0,0),('B451F2A0F6D011E88A0AB1CA91FA338B','r_comment','IP_ADDRESS','IP Address of the Commenter','',1,15,NULL,2,0,0),('B451F2A1F6D011E88A0AB1CA91FA338B','r_comment','USER','Commenter ID','',1,64,NULL,3,0,0),('B451F2A2F6D011E88A0AB1CA91FA338B','r_comment','SECTION_ID','Section ID','',1,10,NULL,4,0,0),('B451F2A3F6D011E88A0AB1CA91FA338B','r_comment','SUBMIT_TIME','Comment Submission Time ','',8,NULL,NULL,5,0,0),('B4FEB170E9AB11E8A19CAD4641175046','r_test001','FIELD3',NULL,NULL,3,0,0,0,0,0),('B59B1D2C744E031100DF2E5A86575C43','blog_c','USER',NULL,NULL,1,64,NULL,0,NULL,0),('B829F4E362527EAEA77A1316ED354BEA','r_address','PRIMARY','Boolean in general','PRIMARY',3,NULL,NULL,7,0,NULL),('B9E09860F32E11E9AB756F2008E0531B','r_retail_customer','GENDER','Gender','GENDER',1,10,NULL,4,0,NULL),('B9E09861F32E11E9AB756F2008E0531B','r_retail_customer','DISPLAY_NAME','Display Name','DISPLAY_NAME',1,128,NULL,5,0,NULL),('B9E09862F32E11E9AB756F2008E0531B','r_retail_customer','BIRTHDAY','Birthday','BIRTHDAY',7,NULL,NULL,6,0,NULL),('B9E09863F32E11E9AB756F2008E0531B','r_retail_customer','CREDIT','Customer credit','CREDIT',2,NULL,NULL,7,0,NULL),('BA7C6ED0F6E911E8BA6405D0C7818287','r_comment','COMMENT_GUID','Comment GUID','',1,32,NULL,6,1,0),('D64809E480B5958454AF5CD8C40B014F','r_employee','USER_ID','User ID','USER_ID',1,10,NULL,1,1,NULL),('D84D9A544984A20BCF0BAD59977277E8','r_user','USER_ID','User ID','USER_ID',1,10,NULL,1,1,NULL),('D8CDF1E5208AF30FE47D272DA304DE71','r_personalization','LANGUAGE','Language Code','LANGUAGE_CODE',1,6,NULL,2,0,NULL),('DB3D668D338E076626061456992F60DB','r_user','DISPLAY_NAME','Display Name','DISPLAY_NAME',1,128,NULL,3,NULL,NULL),('E0392472ABB6DB7FDB5FFC92B5DC7A29','r_user','FAMILY_NAME','Family Name','FAMILY_NAME',1,64,NULL,6,NULL,NULL),('E2165680F2E811E9AB756F2008E0531B','order','TYPE','Order type','ORDER_TYPE',1,10,NULL,0,0,NULL),('E2167D90F2E811E9AB756F2008E0531B','order','CREATED_BY','The user who created the entity','CREATED_BY',1,10,NULL,1,0,NULL),('E2167D91F2E811E9AB756F2008E0531B','order','CREATE_TIME','Time when the object is created','CREATE_TIME',8,NULL,NULL,2,0,NULL),('E2167D92F2E811E9AB756F2008E0531B','order','CHANGED_BY','The user who changed the entity','CHANGED_BY',1,10,NULL,3,0,NULL),('E2167D93F2E811E9AB756F2008E0531B','order','CHANGE_TIME','Time when an object is changed','CHANGE_TIME',8,NULL,NULL,4,0,NULL),('E38ECBB05DB911E9929E67A69E53053F','rs_system_role_category','app_category_INSTANCE_GUID','Entity Instance GUID of role app_category','',1,32,NULL,1,0,0),('E38ECBB15DB911E9929E67A69E53053F','rs_system_role_category','app_category_ENTITY_ID','Entity ID of role app_category','',1,32,NULL,2,0,0),('E38ECBB25DB911E9929E67A69E53053F','rs_system_role_category','system_role_INSTANCE_GUID','Entity Instance GUID of role system_role','',1,32,NULL,3,0,0),('E38ECBB35DB911E9929E67A69E53053F','rs_system_role_category','system_role_ENTITY_ID','Entity ID of role system_role','',1,32,NULL,4,0,0),('E49BF959EF2B47CE8E6820F648C7468D','blog','ABSTRACT','Blog Abstract',NULL,1,256,NULL,7,NULL,0),('E5016EE79DC1B36DAAA9027173674BB4','r_employee','TITLE','Position title','POSITION_TITLE',1,64,NULL,2,0,NULL),('E6FF69F311DCE5E6328029FB932F20E3','r_employee','GENDER','Gender','GENDER',1,10,NULL,3,0,NULL),('E801A3631E3C43E128F397AF9B7174CF','person','FINGER_PRINT','Finger Print',NULL,1,60,NULL,4,NULL,0),('EAD0E0F1E4E147A99DA2FA1F9CB24FA3','blog','NAME','Blog Name',NULL,1,64,NULL,8,NULL,0),('ED15E1F3DB7F1B011871CEAC628CF06C','r_personalization','USER_ID','User ID','USER_ID',1,10,NULL,1,1,NULL),('F738955296FF60A2B57B42ED496773B0','blog_c','SECTION_ID',NULL,NULL,1,10,NULL,0,NULL,0),('F91D45E15DC011E9BC3DE104595EF532','rs_user_role','system_role_INSTANCE_GUID','Entity Instance GUID of role system_role','',1,32,NULL,5,0,0),('F91D45E25DC011E9BC3DE104595EF532','rs_user_role','system_role_ENTITY_ID','Entity ID of role system_role','',1,32,NULL,6,0,0),('F91D45E35DC011E9BC3DE104595EF532','rs_user_role','system_user_INSTANCE_GUID','Entity Instance GUID of role system_user','',1,32,NULL,7,0,0),('F91D45E45DC011E9BC3DE104595EF532','rs_user_role','system_user_ENTITY_ID','Entity ID of role system_user','',1,32,NULL,8,0,0),('FF01C9708ABD11E9B33AE323F41A492C','person','SYSTEM_ACCESS','Software Logical System','LOGICAL_SYSTEM',1,20,NULL,9,0,0);
/*!40000 ALTER TABLE `ATTRIBUTE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `BATCHJOB`
--

DROP TABLE IF EXISTS `BATCHJOB`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `BATCHJOB` (
  `JOB_GUID` varchar(32) NOT NULL,
  `STATUS` int(11) DEFAULT NULL COMMENT '0: SAVED\n1: READY\n2: RUNNING\n3. FINISHED\n4. ERROR',
  `NUM_PAGES` int(11) DEFAULT NULL COMMENT 'Number of Pages in the job',
  `JOB_DESC` varchar(500) DEFAULT NULL,
  `OPTIONS` varchar(200) DEFAULT NULL COMMENT 'Job Options',
  `SUB_EMAIL` varchar(150) DEFAULT NULL,
  `EMAIL_STATUS` int(11) DEFAULT NULL COMMENT '0: Not Send\n1: Sent\n2: Failed',
  `CREATE_TIME` datetime DEFAULT NULL COMMENT 'Job create time',
  `FINISH_TIME` datetime DEFAULT NULL COMMENT 'Job finish time',
  `PROCESS_MSG` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`JOB_GUID`),
  KEY `today` (`CREATE_TIME`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BATCHJOB`
--

LOCK TABLES `BATCHJOB` WRITE;
/*!40000 ALTER TABLE `BATCHJOB` DISABLE KEYS */;
INSERT INTO `BATCHJOB` VALUES ('04E54AE0E79411E59B1AE773C5E34405',3,1,'http://c7e56444.i9p.co/forumdisplay.php?fid=19&page=2','{\"format\":\"pdf\",\"width\":1225,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-11 22:17:42','2016-03-11 22:17:53','{\"ETag\":\"\\\"7AF017DD799207FFE014DD2A353EBB70\\\"\",\"RequestId\":\"56E2D39028001A39585411F3\",\"size\":400748}'),('16120AE0E79611E5B90EEBFCB7050D35',3,1,'https://mp.weixin.qq.com/s?__biz=MTQzMjE1NjQwMQ==&mid=406653916&idx=1&sn=97b1284ce5c558aa05d34a78197d0e94&scene=0&uin=NzQ3ODcyMTYw&key=710a5d99946419d9d28aa5ff8abd6bc77c92e5173ad380021d5752d0f5c055aba54737217249badd1850a401727aa37f&devicetype=iMac+MacBookPro11%2C1+OSX+OSX+10.11.3+build(15D21)&version=11020201&lang=en&pass_ticket=z8ZGbLzQsPkstSFl9Tp%2B6k3aHL02Rsib1lVQ%2BmTNBhQ%2BbDBY6Ff0sZiJTKvT05V%2B','{\"format\":\"pdf\",\"width\":1032,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-11 22:32:30','2016-03-11 22:32:38','{\"ETag\":\"\\\"478097D488C48ACEF4B5102928BBFD0C\\\"\",\"RequestId\":\"56E2D701B89D946C2B5423B9\",\"size\":795884}'),('18D7FC5052E311E5929B51C6A26AEF0A',3,1,'http://tool.oschina.net/commons?type=2','{\"format\":\"gif\",\"width\":1230,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2015-09-04 16:58:23','2015-09-04 16:58:43','{\"ETag\":\"\\\"A7F9C5987DA6242235DFB179F2D0509D\\\"\",\"RequestId\":\"55E95D3B9E642C775DBD0D7C\",\"size\":182673}'),('18E52920E6C711E59F5617132DADF094',3,1,'http://www.cpplive.com/html/1325.html','{\"format\":\"pdf\",\"width\":1225,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-10 21:50:49','2016-03-10 21:51:05','{\"ETag\":\"\\\"9921F17975E136891544DB59E08CFA9B\\\"\",\"RequestId\":\"56E17BC811083A0A7A43809A\",\"size\":570052}'),('1B99FCF0E79811E5AEB86D7EF70F3A4A',3,1,'https://mp.weixin.qq.com/s?__biz=MTQzMjE1NjQwMQ==&mid=406653916&idx=1&sn=97b1284ce5c558aa05d34a78197d0e94&scene=0&uin=NzQ3ODcyMTYw&key=710a5d99946419d9d28aa5ff8abd6bc77c92e5173ad380021d5752d0f5c055aba54737217249badd1850a401727aa37f&devicetype=iMac+MacBookPro11%2C1+OSX+OSX+10.11.3+build(15D21)&version=11020201&lang=en&pass_ticket=z8ZGbLzQsPkstSFl9Tp%2B6k3aHL02Rsib1lVQ%2BmTNBhQ%2BbDBY6Ff0sZiJTKvT05V%2B','{\"format\":\"pdf\",\"width\":1280,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-11 22:46:58','2016-03-11 22:47:02','{\"ETag\":\"\\\"1B03E5D64640402035A0A29ECE07126C\\\"\",\"RequestId\":\"56E2DA6554D899165353EBA3\",\"size\":428158}'),('2A486270E6C911E58988EFD8747F271D',3,1,'http://www.huxiu.com/article/141451/1.html#rd?sukey=16298ae1a3e33631f715c75fc7e94ffaf2dadb5891b323aeff8b7137a866bfdb77f17dadff8553a65cf31f2be2730012','{\"format\":\"pdf\",\"width\":1225,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-10 22:05:37','2016-03-10 22:05:45','{\"ETag\":\"\\\"BFDD235E8FEF8483D7701F5EBA66E37A\\\"\",\"RequestId\":\"56E17F388CEE31FB06443FB3\",\"size\":619286}'),('2A849520E79A11E59703A9B7DCE723FE',3,1,'https://mp.weixin.qq.com/s?__biz=MTQzMjE1NjQwMQ==&mid=406653916&idx=1&sn=97b1284ce5c558aa05d34a78197d0e94&scene=0&uin=NzQ3ODcyMTYw&key=710a5d99946419d9d28aa5ff8abd6bc77c92e5173ad380021d5752d0f5c055aba54737217249badd1850a401727aa37f&devicetype=iMac+MacBookPro11%2C1+OSX+OSX+10.11.3+build(15D21)&version=11020201&lang=en&pass_ticket=z8ZGbLzQsPkstSFl9Tp%2B6k3aHL02Rsib1lVQ%2BmTNBhQ%2BbDBY6Ff0sZiJTKvT05V%2B','{\"format\":\"pdf\",\"width\":1280,\"height\":10000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-11 23:01:42','2016-03-11 23:01:45','{\"ETag\":\"\\\"B4000694359C13CB9078D898428FBD5E\\\"\",\"RequestId\":\"56E2DDD88D46FE8C3F551894\",\"size\":795784}'),('30B9E820625D11E7A8759FA3BB9F0669',3,1,'http://www.paulgraham.com/icad.html','{\"format\":\"pdf\",\"width\":1222,\"height\":10000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}','zklee@hotmail.com',2,'2017-07-06 23:10:04','2017-07-06 23:10:11','{\"ETag\":\"\\\"4B8403490B8A010CFDB41E803DF02631\\\"\",\"RequestId\":\"595E52CFEF4B77D92A69D554\",\"size\":107657}'),('3D8EA2101F9711E7949EA58BDA4950E9',5,NULL,'speiyou','{\"username\":\"163010290531\",\"password\":\"yiwen1984\",\"clsid\":\"ff8080815b5afbfc015b5c3c6da6387e\",\"registTime\":\"2017-04-12T23:47\"}',NULL,NULL,'2017-04-12 23:46:49','2017-04-12 23:47:02','参数为空!'),('40FEBDF0E79811E5AF6DD5300227FF54',3,1,'https://mp.weixin.qq.com/s?__biz=MTQzMjE1NjQwMQ==&mid=406653916&idx=1&sn=97b1284ce5c558aa05d34a78197d0e94&scene=0&uin=NzQ3ODcyMTYw&key=710a5d99946419d9d28aa5ff8abd6bc77c92e5173ad380021d5752d0f5c055aba54737217249badd1850a401727aa37f&devicetype=iMac+MacBookPro11%2C1+OSX+OSX+10.11.3+build(15D21)&version=11020201&lang=en&pass_ticket=z8ZGbLzQsPkstSFl9Tp%2B6k3aHL02Rsib1lVQ%2BmTNBhQ%2BbDBY6Ff0sZiJTKvT05V%2B','{\"format\":\"pdf\",\"width\":1280,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-11 22:48:01','2016-03-11 22:48:05','{\"ETag\":\"\\\"67DD803AB06CC26261212B6F6C408D53\\\"\",\"RequestId\":\"56E2DAA45581D1FA5F54DF87\",\"size\":795793}'),('41DD2300E6C711E59F5617132DADF094',3,1,'http://c7e56444.i9p.co/forumdisplay.php?fid=19','{\"format\":\"pdf\",\"width\":1225,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-10 21:51:58','2016-03-10 21:52:12','{\"ETag\":\"\\\"54C15C58AA14BFBD41477EA90CEF0679\\\"\",\"RequestId\":\"56E17C0B5581D1FA5F43FAEF\",\"size\":352711}'),('428AA330E79A11E59703A9B7DCE723FE',3,1,'http://c7e56444.i9p.co/viewthread.php?tid=195490&extra=page%3D2','{\"format\":\"pdf\",\"width\":1280,\"height\":10000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-11 23:02:23','2016-03-11 23:02:50','{\"ETag\":\"\\\"20BB61FD88C47722B7A4C299CB69E185\\\"\",\"RequestId\":\"56E2DE15836928A43C5431EC\",\"size\":1851252}'),('459717E0625D11E781FBE918A6F5D0B3',3,1,'http://www.paulgraham.com/icad.html','{\"format\":\"pdf\",\"width\":1222,\"height\":10000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}','zklee@hotmail.com',2,'2017-07-06 23:10:39','2017-07-06 23:10:50','{\"ETag\":\"\\\"6681033766DFD192C5436FABE537E9E2\\\"\",\"RequestId\":\"595E52F554D8993F366BACF4\",\"size\":107657}'),('4AD00E70F29B11E58E4BA913729209C9',3,1,'http://baike.baidu.com/view/259463.htm','{\"format\":\"pdf\",\"width\":1225,\"height\":10000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-25 23:07:29','2016-03-25 23:07:36','{\"ETag\":\"\\\"5CB0BB241376A94187B47F6F8768E096\\\"\",\"RequestId\":\"56F55438723E760A71B7B896\",\"size\":484197}'),('4D28C8D0E79511E59B1AE773C5E34405',3,1,'https://mp.weixin.qq.com/s?__biz=MTQzMjE1NjQwMQ==&mid=406653916&idx=1&sn=97b1284ce5c558aa05d34a78197d0e94&scene=0&uin=NzQ3ODcyMTYw&key=710a5d99946419d9d28aa5ff8abd6bc77c92e5173ad380021d5752d0f5c055aba54737217249badd1850a401727aa37f&devicetype=iMac+MacBookPro11%2C1+OSX+OSX+10.11.3+build(15D21)&version=11020201&lang=en&pass_ticket=z8ZGbLzQsPkstSFl9Tp%2B6k3aHL02Rsib1lVQ%2BmTNBhQ%2BbDBY6Ff0sZiJTKvT05V%2B','{\"format\":\"pdf\",\"width\":1225,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-11 22:26:53','2016-03-11 22:26:57','{\"ETag\":\"\\\"A9F574823C4628E818938AE81E820A5A\\\"\",\"RequestId\":\"56E2D5B0723E760A715407A3\",\"size\":409541}'),('4E58DF90625C11E7A8759FA3BB9F0669',3,1,'http://www.paulgraham.com/icad.html','{\"format\":\"pdf\",\"width\":1222,\"height\":10000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}','zklee@hotmail.com',2,'2017-07-06 23:03:44','2017-07-06 23:03:59','{\"ETag\":\"\\\"1FC682CB39659CE756F27DFCE8C7F3F8\\\"\",\"RequestId\":\"595E515B2F0A42CF196A7257\",\"size\":107657}'),('4F3A89A052DB11E5929B51C6A26AEF0A',3,2,'http://www.gslb.cn/chapter01.htm#14','{\"format\":\"pdf\",\"width\":1230,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}','zklee@hotmail.com',1,'2015-09-04 16:02:38','2015-09-04 16:03:11','{\"ETag\":\"\\\"83F05BE5776EE7C33B9DEEB94EE81658\\\"\",\"RequestId\":\"55E9501ED4F1CB438ABB5DFC\",\"size\":22070093}'),('5D2A85801F9711E7BE02C59F47EB4693',5,NULL,'speiyou','{\"username\":\"163010290531\",\"password\":\"yiwen1984\",\"clsid\":\"ff8080815b5afbfc015b5c3c6da6387e\",\"registTime\":\"2017-04-12T23:48\"}',NULL,NULL,'2017-04-12 23:47:42','2017-04-12 23:48:03','参数为空!'),('6A1DD7F052E411E59EA1617580937C91',3,1,'http://tool.oschina.net','{\"format\":\"jpeg\",\"width\":1230,\"height\":705,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2015-09-04 17:07:49','2015-09-04 17:07:51','{\"ETag\":\"\\\"61F0F109F2530C6D07AFF9CF2A8B83E1\\\"\",\"RequestId\":\"55E95F60D4F1CB438ABD8B2D\",\"size\":148711}'),('7080AB9052E411E59EA1617580937C91',3,1,'http://tool.oschina.net','{\"format\":\"png\",\"width\":1230,\"height\":705,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2015-09-04 17:07:59','2015-09-04 17:08:02','{\"ETag\":\"\\\"F8C49CDB9106B011629FD33A7C71FB20\\\"\",\"RequestId\":\"55E95F6AD694F6F732BDC17B\",\"size\":461639}'),('763B6C10E79411E59B1AE773C5E34405',3,1,'http://www.voachinese.com/','{\"format\":\"pdf\",\"width\":1225,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-11 22:20:52','2016-03-11 22:22:12','{\"ETag\":\"\\\"9BFFE7BE7B0F4A877C184659F73FD9CB\\\"\",\"RequestId\":\"56E2D4928CEE31FB0654A80C\",\"size\":1237472}'),('77323B7052E411E59EA1617580937C91',3,1,'http://tool.oschina.net','{\"format\":\"gif\",\"width\":1230,\"height\":705,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2015-09-04 17:08:11','2015-09-04 17:08:13','{\"ETag\":\"\\\"C35D8A5D5E9109038F74D4320225643D\\\"\",\"RequestId\":\"55E95F76D4F1CB438ABD8DAE\",\"size\":155078}'),('77D10130E78911E590DFF53989808425',3,1,'http://c7e56444.i9p.co/forumdisplay.php?fid=19','{\"format\":\"pdf\",\"width\":1225,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-11 21:02:11','2016-03-11 21:02:25','{\"ETag\":\"\\\"14367F3699B3D9CBA97F5BC517FB61F0\\\"\",\"RequestId\":\"56E2C1E16162A6CB765297B4\",\"size\":427078}'),('7919D3E0E79411E59B1AE773C5E34405',3,1,'http://www.voachinese.com/','{\"format\":\"pdf\",\"width\":1225,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-11 22:20:57','2016-03-11 22:23:28','{\"ETag\":\"\\\"D436203D5ECB8AE0DE46B84C3AEB1F8E\\\"\",\"RequestId\":\"56E2D4DB9CD45FA50354395F\",\"size\":1241707}'),('824BDF60556011E58ABE2DE28FFAEFBA',3,1,'http://www.jrj.com.cn/','{\"format\":\"pdf\",\"width\":1230,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2015-09-07 21:01:09','2015-09-07 21:01:17','{\"ETag\":\"\\\"8F63F65AD1423F428818DBF0DC8800DA\\\"\",\"RequestId\":\"55ED8A9CD694F6F732821696\",\"size\":1297533}'),('8257C74052E411E59EA1617580937C91',3,1,'http://tool.oschina.net','{\"format\":\"pdf\",\"width\":1230,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2015-09-04 17:08:29','2015-09-04 17:08:35','{\"ETag\":\"\\\"D7E79C2A44EDC489430CBD3825887C9B\\\"\",\"RequestId\":\"55E95F89D4F1CB438ABD8FFF\",\"size\":2921831}'),('83EF3EE052DE11E5929B51C6A26AEF0A',3,1,'http://oascentral.wenxuecity.com/RealMedia/ads/click_lx.ads/wxc.com/click/1112745096/x01/ChinaGate/hanyastar_news_hp/hanyastar_120x90.jpg/1','{\"format\":\"pdf\",\"width\":1230,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2015-09-04 16:25:35','2015-09-04 16:25:46','{\"ETag\":\"\\\"9C03F92121A6CA0A14154D6AA6F6FA57\\\"\",\"RequestId\":\"55E9557E09B152A48AB9BFAA\",\"size\":4518943}'),('855B5B40E6C911E58988EFD8747F271D',3,1,'https://mp.weixin.qq.com/s?__biz=MTQzMjE1NjQwMQ==&mid=406642898&idx=2&sn=ab4b3bd6c9cc6fa01773c3bb1440207b&scene=0&key=710a5d99946419d96590a7511deb0365d05b44acea50f572df0472a8f1affabdd0aa8aa66b5832814bc3569a59d16f28&ascene=0&uin=NzQ3ODcyMTYw&devicetype=iMac+MacBookPro11%2C1+OSX+OSX+10.11.3+build(15D21)&version=11020201&pass_ticket=ApikSdwKNAZTyD9o8gCiSm3To8nxGeNIsDQZF0Jopj0Q76eknhGL49Sfj%2FSoLCJ6','{\"format\":\"pdf\",\"width\":1225,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-10 22:08:10','2016-03-10 22:08:12','{\"ETag\":\"\\\"AC98C53A6BF4CBC5B24D31572600B805\\\"\",\"RequestId\":\"56E17FCBFB4094FC7D426FB2\",\"size\":124718}'),('8B8C74101F9711E7B5041B0B65464FA6',5,NULL,'speiyou','{\"username\":\"163010290531\",\"password\":\"yiwen1984\",\"clsid\":\"ff8080815b5afbfc015b5c3c6da6387e\",\"registTime\":\"2017-04-12T23:49\"}',NULL,NULL,'2017-04-12 23:48:59','2017-04-12 23:49:05','该级别的班级需要进行入学测试！'),('8F582800E79911E5A1DEF573ACE221D1',3,1,'https://mp.weixin.qq.com/s?__biz=MTQzMjE1NjQwMQ==&mid=406653916&idx=1&sn=97b1284ce5c558aa05d34a78197d0e94&scene=0&uin=NzQ3ODcyMTYw&key=710a5d99946419d9d28aa5ff8abd6bc77c92e5173ad380021d5752d0f5c055aba54737217249badd1850a401727aa37f&devicetype=iMac+MacBookPro11%2C1+OSX+OSX+10.11.3+build(15D21)&version=11020201&lang=en&pass_ticket=z8ZGbLzQsPkstSFl9Tp%2B6k3aHL02Rsib1lVQ%2BmTNBhQ%2BbDBY6Ff0sZiJTKvT05V%2B','{\"format\":\"pdf\",\"width\":1280,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-11 22:57:22','2016-03-11 22:57:26','{\"ETag\":\"\\\"CD20B49FE87BAA31BE3D19082FD0DC10\\\"\",\"RequestId\":\"56E2DCD5C75D98237454CDC9\",\"size\":809437}'),('9130CCE052DE11E5929B51C6A26AEF0A',3,1,'http://www.wenxuecity.com/','{\"format\":\"png\",\"width\":1230,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2015-09-04 16:25:57','2015-09-04 16:27:42','{\"ETag\":\"\\\"D21679F36B7F89267677D7FBBC5ECE62\\\"\",\"RequestId\":\"55E955F509B152A48AB9CDB9\",\"size\":2354567}'),('92F25900E78911E590DFF53989808425',3,1,'http://c7e56444.i9p.co/forumdisplay.php?fid=19','{\"format\":\"pdf\",\"width\":1225,\"height\":100000,\"orientation\":\"Landscape\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-11 21:02:56','2016-03-11 21:03:08','{\"ETag\":\"\\\"E99A6626365DCD11FFFC10D81FB0F1A5\\\"\",\"RequestId\":\"56E2C20C9CD45FA503534BA1\",\"size\":427774}'),('9C862040E79411E59B1AE773C5E34405',3,1,'https://fanqianghou.com/','{\"format\":\"pdf\",\"width\":1225,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-11 22:21:57','2016-03-11 22:23:39','{\"ETag\":\"\\\"6B89D99DE10A69F72A92DACD878E1D16\\\"\",\"RequestId\":\"56E2D4EB5581D1FA5F549353\",\"size\":536037}'),('A34C1320625A11E79883D97DDDDB0D38',3,1,'http://www.henan.gov.cn/zwgk/system/2010/03/05/010182357.shtml','{\"format\":\"pdf\",\"width\":1222,\"height\":10000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}','zklee@hotmail.com',2,'2017-07-06 22:51:48','2017-07-06 22:51:57','{\"ETag\":\"\\\"CCD0733FE09EE43B14B7DC99005AF610\\\"\",\"RequestId\":\"595E4E888D46FECC3C689391\",\"size\":305127}'),('A3718910E6C911E58988EFD8747F271D',3,1,'https://mp.weixin.qq.com/s?__biz=MTQzMjE1NjQwMQ==&mid=406642898&idx=1&sn=37f52cff39565c9c503620aca5472d0c&scene=0&key=710a5d99946419d9b40b13fd144d3e3a5f07506265f4922c07ea90296bc196b909aa4a39be58c96aaf0b3b328e2e7f7d&ascene=0&uin=NzQ3ODcyMTYw&devicetype=iMac+MacBookPro11%2C1+OSX+OSX+10.11.3+build(15D21)&version=11020201&pass_ticket=ApikSdwKNAZTyD9o8gCiSm3To8nxGeNIsDQZF0Jopj0Q76eknhGL49Sfj%2FSoLCJ6','{\"format\":\"pdf\",\"width\":1225,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-10 22:09:00','2016-03-10 22:09:02','{\"ETag\":\"\\\"91061F4B96FBD9ECB8EB6A90AE98FD3E\\\"\",\"RequestId\":\"56E17FFE6162A6CB76430EF8\",\"size\":415147}'),('A60C5CB052E311E59EA1617580937C91',3,1,'http://tool.oschina.net/','{\"format\":\"pdf\",\"width\":1230,\"height\":705,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2015-09-04 17:02:20','2015-09-04 17:02:28','{\"ETag\":\"\\\"E48848F78F7FD33C3F910B41DE438D11\\\"\",\"RequestId\":\"55E95E1909B152A48ABADBEB\",\"size\":2921831}'),('A6DFD3C0E79811E58214F995E5E35826',3,1,'https://mp.weixin.qq.com/s?__biz=MTQzMjE1NjQwMQ==&mid=406653916&idx=1&sn=97b1284ce5c558aa05d34a78197d0e94&scene=0&uin=NzQ3ODcyMTYw&key=710a5d99946419d9d28aa5ff8abd6bc77c92e5173ad380021d5752d0f5c055aba54737217249badd1850a401727aa37f&devicetype=iMac+MacBookPro11%2C1+OSX+OSX+10.11.3+build(15D21)&version=11020201&lang=en&pass_ticket=z8ZGbLzQsPkstSFl9Tp%2B6k3aHL02Rsib1lVQ%2BmTNBhQ%2BbDBY6Ff0sZiJTKvT05V%2B','{\"format\":\"pdf\",\"width\":1280,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-11 22:50:52','2016-03-11 22:50:57','{\"ETag\":\"\\\"E7EF69150CF5FF0E47DE7EB160BF500E\\\"\",\"RequestId\":\"56E2DB4E9CD45FA5035489B6\",\"size\":795793}'),('A99C614052E311E59EA1617580937C91',3,1,'http://tool.oschina.net/','{\"format\":\"png\",\"width\":1230,\"height\":705,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2015-09-04 17:02:26','2015-09-04 17:02:32','{\"ETag\":\"\\\"F8C49CDB9106B011629FD33A7C71FB20\\\"\",\"RequestId\":\"55E95E1F9E642C775DBD2C92\",\"size\":461639}'),('B2C12A50625711E7BDFCFB555655EB0A',3,1,'http://www.henan.gov.cn/zwgk/system/2010/03/05/010182357.shtml','{\"format\":\"pdf\",\"width\":1222,\"height\":10000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}','zklee@hotmail.com',2,'2017-07-06 22:30:45','2017-07-06 22:30:50','{\"ETag\":\"\\\"E690EFC027158850F54548067B93A17C\\\"\",\"RequestId\":\"595E4995C75D984264641228\",\"size\":305127}'),('B487A7B0F29B11E5B3B367E16684419C',3,1,'https://zh.wikipedia.org/wiki/%E5%93%A5%E5%BB%B7%E6%A0%B9%E5%A4%A7%E5%AD%A6','{\"format\":\"pdf\",\"width\":1225,\"height\":10000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-25 23:10:26','2016-03-25 23:10:50','{\"ETag\":\"\\\"D0C82CA80E163CE362160DAA992DD9B6\\\"\",\"RequestId\":\"56F554F928001A3958B97DA9\",\"size\":651431}'),('B64F3C10E78911E590DFF53989808425',3,1,'http://c7e56444.i9p.co/forumdisplay.php?fid=19','{\"format\":\"pdf\",\"width\":1225,\"height\":100000,\"orientation\":\"Landscape\",\"paperFormat\":\"A4\",\"margin\":\"0cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-11 21:03:55','2016-03-11 21:04:11','{\"ETag\":\"\\\"1436097BA15013EE7F689E539A82C8A0\\\"\",\"RequestId\":\"56E2C248B7190AA34E5347CE\",\"size\":433009}'),('B703B0A0555D11E591AB210D7D4C8FCC',3,1,'http://expressjs.com/3x/api.html#res.set','{\"format\":\"pdf\",\"width\":1230,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2015-09-07 20:41:09','2015-09-07 20:41:45','{\"ETag\":\"\\\"826906C0D3A315855455ADE67E016542\\\"\",\"RequestId\":\"55ED85F609B152A48A7E07E1\",\"size\":13303083}'),('BD65DEA0625D11E7A04FD9AF5FE13319',3,1,'http://www.paulgraham.com/icad.html','{\"format\":\"pdf\",\"width\":1222,\"height\":10000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}','zklee@hotmail.com',2,'2017-07-06 23:14:00','2017-07-06 23:14:11','{\"ETag\":\"\\\"635D252B3B4FF3995ABE3A44B8B327A3\\\"\",\"RequestId\":\"595E53BF83692837026FED01\",\"size\":107657}'),('C08348B0E79911E59703A9B7DCE723FE',3,1,'https://mp.weixin.qq.com/s?__biz=MTQzMjE1NjQwMQ==&mid=406653916&idx=1&sn=97b1284ce5c558aa05d34a78197d0e94&scene=0&uin=NzQ3ODcyMTYw&key=710a5d99946419d9d28aa5ff8abd6bc77c92e5173ad380021d5752d0f5c055aba54737217249badd1850a401727aa37f&devicetype=iMac+MacBookPro11%2C1+OSX+OSX+10.11.3+build(15D21)&version=11020201&lang=en&pass_ticket=z8ZGbLzQsPkstSFl9Tp%2B6k3aHL02Rsib1lVQ%2BmTNBhQ%2BbDBY6Ff0sZiJTKvT05V%2B','{\"format\":\"pdf\",\"width\":1280,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-11 22:58:45','2016-03-11 22:58:51','{\"ETag\":\"\\\"CF0545462FF6AD99420BD606B9302E96\\\"\",\"RequestId\":\"56E2DD289302422530549E92\",\"size\":795793}'),('C7E6D890E79B11E58BE0F93945DC3C22',3,1,'https://fanqianghou.com/','{\"format\":\"pdf\",\"width\":1280,\"height\":10000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-11 23:13:16','2016-03-11 23:14:34','{\"ETag\":\"\\\"C63F3B9AAEB8D1EEE9FC343253F3A344\\\"\",\"RequestId\":\"56E2E0D893A2A23E2E550FC4\",\"size\":524424}'),('CBABF4790F7B4E3F981F83787D03277D',3,0,'http://wwww.baidu.com','{\"format\":\"pdf\",\"width\":1306,\"height\":710,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}','zklee@hotmail.com',0,'2015-07-11 23:22:50','2015-07-11 23:22:50',NULL),('CD7083E0E79311E587048B04D69C0C37',4,1,'https://fanqianghou.com/','{\"format\":\"pdf\",\"width\":1225,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-11 22:16:09','2016-03-11 22:16:35','{\"msgName\":\"PHANTOM_RENDER_ERROR\",\"msgType\":\"E\",\"msgText\":\"网页转换时发生错误，可能是该网页无法访问。Error: ENOENT, open \'/tmp/phantom-render-stream/5784.4071140537ea0bd3013f0efe71b55553.pdf\'\"}'),('CD9A9A20624B11E7BCF1A53873F65B5D',3,1,'http://dinosaur.compilertools.net/','{\"format\":\"pdf\",\"width\":1222,\"height\":10000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2017-07-06 21:05:36','2017-07-06 21:05:42','{\"ETag\":\"\\\"349C025539D442736F1A3BB6273F668F\\\"\",\"RequestId\":\"595E35A0C75D98426454053F\",\"size\":71140}'),('D22F1B9052E111E5929B51C6A26AEF0A',3,1,'http://tool.oschina.net/commons?type=2','{\"format\":\"png\",\"width\":1230,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2015-09-04 16:49:15','2015-09-04 16:49:31','{\"ETag\":\"\\\"09E12DF575C3BA0204DA131EDAF6A084\\\"\",\"RequestId\":\"55E95B12D4F1CB438ABCFB06\",\"size\":751385}'),('D423D2A0E9C711E6853B917BEA847AFB',2,NULL,'http://wwww.baidu.com','{\"format\":\"png\",\"width\":1920,\"height\":1080}','zklee@hotmail.com',0,'2017-02-03 12:18:34','2017-02-03 12:18:34','null'),('D5825130E9C711E6853B917BEA847AFB',2,NULL,'speiyou','{\"username\":\"163010290531\",\"password\":\"zkle1984\",\"clsid\":\"ff8080815830b86a0158337501930db6\",\"registTime\":\"2017/02/03 12:19:25\"}',NULL,NULL,'2017-02-03 12:18:37','2017-02-03 12:18:37','Running'),('D6C2C3A0548511E5B95EEF8B8182CFC4',3,1,'http://twitter.github.io/scala_school/basics2.html','{\"format\":\"pdf\",\"width\":1230,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2015-09-06 18:55:51','2015-09-06 18:55:59','{\"ETag\":\"\\\"A0CF677D3CD6A56B480885C8A1A68A12\\\"\",\"RequestId\":\"55EC1BBC09B152A48A2B877E\",\"size\":3100928}'),('E156F790E79311E587048B04D69C0C37',4,1,'http://c7e56444.i9p.co/forumdisplay.php?fid=19&page=2','{\"format\":\"pdf\",\"width\":1225,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-11 22:16:43','2016-03-11 22:16:50','{\"msgName\":\"PHANTOM_RENDER_ERROR\",\"msgType\":\"E\",\"msgText\":\"网页转换时发生错误，可能是该网页无法访问。Error: ENOENT, open \'/tmp/phantom-render-stream/5784.602a0bc76aa751665ec67ae47e462b13.pdf\'\"}'),('E690F0B0E79511E581A1E5044B46FCD7',3,1,'https://mp.weixin.qq.com/s?__biz=MTQzMjE1NjQwMQ==&mid=406653916&idx=1&sn=97b1284ce5c558aa05d34a78197d0e94&scene=0&uin=NzQ3ODcyMTYw&key=710a5d99946419d9d28aa5ff8abd6bc77c92e5173ad380021d5752d0f5c055aba54737217249badd1850a401727aa37f&devicetype=iMac+MacBookPro11%2C1+OSX+OSX+10.11.3+build(15D21)&version=11020201&lang=en&pass_ticket=z8ZGbLzQsPkstSFl9Tp%2B6k3aHL02Rsib1lVQ%2BmTNBhQ%2BbDBY6Ff0sZiJTKvT05V%2B','{\"format\":\"pdf\",\"width\":1032,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-11 22:31:10','2016-03-11 22:31:13','{\"ETag\":\"\\\"CC8F54E81A24EB9932283B7D0F21EE61\\\"\",\"RequestId\":\"56E2D6B1B89D946C2B541FCE\",\"size\":411589}'),('F6F69780E79411E59B1AE773C5E34405',3,1,'http://c7e56444.i9p.co/viewthread.php?tid=195490&extra=page%3D2','{\"format\":\"pdf\",\"width\":1225,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-11 22:24:28','2016-03-11 22:24:56','{\"ETag\":\"\\\"ED370BE420368941035B727FFBF13A39\\\"\",\"RequestId\":\"56E2D52C54D899165353A772\",\"size\":1882889}'),('F7D1FB3052DA11E5929B51C6A26AEF0A',3,1,'http://www.gslb.cn/chapter01.htm','{\"format\":\"pdf\",\"width\":1230,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}','zklee@hotmail.com',1,'2015-09-04 16:00:11','2015-09-04 16:00:33','{\"ETag\":\"\\\"6DA38B92ED98DECB46168E9E9A7DFFBC\\\"\",\"RequestId\":\"55E94F8B09B152A48AB8BF8D\",\"size\":11055489}'),('FC8D2230555F11E58ABE2DE28FFAEFBA',3,1,'http://www.jrj.com.cn/','{\"format\":\"pdf\",\"width\":1230,\"height\":100000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2015-09-07 20:57:25','2015-09-07 20:57:52','{\"ETag\":\"\\\"B2C7D3CCB1719437598CDA2DB7A98D24\\\"\",\"RequestId\":\"55ED89BCD4F1CB438A81C9C6\",\"size\":13081837}'),('FF855990E79911E59703A9B7DCE723FE',3,1,'https://mp.weixin.qq.com/s?__biz=MTQzMjE1NjQwMQ==&mid=406653916&idx=1&sn=97b1284ce5c558aa05d34a78197d0e94&scene=0&uin=NzQ3ODcyMTYw&key=710a5d99946419d9d28aa5ff8abd6bc77c92e5173ad380021d5752d0f5c055aba54737217249badd1850a401727aa37f&devicetype=iMac+MacBookPro11%2C1+OSX+OSX+10.11.3+build(15D21)&version=11020201&lang=en&pass_ticket=z8ZGbLzQsPkstSFl9Tp%2B6k3aHL02Rsib1lVQ%2BmTNBhQ%2BbDBY6Ff0sZiJTKvT05V%2B','{\"format\":\"pdf\",\"width\":1280,\"height\":3000,\"orientation\":\"Portrait\",\"paperFormat\":\"A4\",\"margin\":\"1cm\",\"headerAndFooter\":true}',NULL,NULL,'2016-03-11 23:00:30','2016-03-11 23:00:32','{\"ETag\":\"\\\"EEFFA069FBFD2B576CFAD44FB3F7912F\\\"\",\"RequestId\":\"56E2DD90FB4094FC7D5353A1\",\"size\":479087}');
/*!40000 ALTER TABLE `BATCHJOB` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CHANGE_LOG`
--

DROP TABLE IF EXISTS `CHANGE_LOG`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CHANGE_LOG` (
  `TENANT_DOMAIN` varchar(63) NOT NULL,
  `OBJECT_ID` varchar(32) NOT NULL COMMENT 'ER_ID/GUID',
  `CHANGE_NO` int(11) unsigned NOT NULL,
  `TYPE` varchar(45) DEFAULT NULL COMMENT 'Change type: Create, Update, Delete, and so on.',
  `DATETIME` datetime DEFAULT NULL,
  `CHANGE_USER` varchar(45) DEFAULT NULL,
  `AUDIT_MEMO` blob,
  PRIMARY KEY (`TENANT_DOMAIN`,`OBJECT_ID`,`CHANGE_NO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CHANGE_LOG`
--

LOCK TABLES `CHANGE_LOG` WRITE;
/*!40000 ALTER TABLE `CHANGE_LOG` DISABLE KEYS */;
INSERT INTO `CHANGE_LOG` VALUES ('darkhouse.com','DB6DAFD80D66D60E486B593AF92A6F2B',1,'Create','2014-09-16 22:15:00','VinceZK',NULL);
/*!40000 ALTER TABLE `CHANGE_LOG` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DATA_DOMAIN`
--

DROP TABLE IF EXISTS `DATA_DOMAIN`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DATA_DOMAIN` (
  `DOMAIN_ID` char(32) NOT NULL,
  `DOMAIN_DESC` varchar(256) DEFAULT NULL,
  `DATA_TYPE` int(4) DEFAULT NULL,
  `DATA_LENGTH` int(4) DEFAULT NULL,
  `DECIMAL` int(2) DEFAULT NULL COMMENT 'Decimal Places',
  `DOMAIN_TYPE` int(1) DEFAULT NULL COMMENT '0: General Type\n1: Regular Expression\n2: Value Relation(Table)\n3: Fixed Values/Ranges',
  `UNSIGNED` tinyint(1) DEFAULT NULL,
  `CAPITAL_ONLY` tinyint(1) DEFAULT NULL,
  `REG_EXPR` varchar(1000) DEFAULT NULL,
  `ENTITY_ID` varchar(32) DEFAULT NULL,
  `RELATION_ID` varchar(32) DEFAULT NULL COMMENT 'Relation that is used as the value domain',
  `VERSION_NO` int(11) unsigned DEFAULT NULL,
  `CREATE_BY` varchar(32) DEFAULT NULL,
  `CREATE_TIME` datetime DEFAULT NULL,
  `LAST_CHANGE_BY` varchar(32) DEFAULT NULL,
  `LAST_CHANGE_TIME` datetime DEFAULT NULL,
  PRIMARY KEY (`DOMAIN_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DATA_DOMAIN`
--

LOCK TABLES `DATA_DOMAIN` WRITE;
/*!40000 ALTER TABLE `DATA_DOMAIN` DISABLE KEYS */;
INSERT INTO `DATA_DOMAIN` VALUES ('ADDRESS_TYPE','Address type',1,10,NULL,3,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 23:22:51','DH001','2019-10-09 23:22:51'),('AMOUNT','Amount with 2 decimals',4,23,2,0,NULL,NULL,NULL,NULL,NULL,3,'DH001','2019-09-29 12:07:31','DH001','2019-10-12 22:54:09'),('APP_ID','Application ID',1,32,NULL,0,NULL,1,NULL,NULL,NULL,1,'DH001','2019-10-09 22:15:23','DH001','2019-10-09 22:15:23'),('BINARY','Binary',6,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-09-29 12:08:34','DH001','2019-09-29 12:08:34'),('BOOLEAN','Boolean',3,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-09-29 12:07:46','DH001','2019-09-29 12:07:46'),('CELL_PHONE_NUMBER','Cell phone number',1,15,NULL,1,NULL,NULL,'^\\+[1-9]{1}[0-9]{3,14}$',NULL,NULL,1,'DH001','2019-10-20 19:32:06','DH001','2019-10-20 19:32:06'),('CITY','City',1,10,NULL,0,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 23:28:10','DH001','2019-10-09 23:28:10'),('COMPANY_ID','Company ID',1,20,NULL,0,NULL,1,NULL,NULL,NULL,3,'DH001','2019-10-09 23:15:09','DH001','2019-10-13 12:56:08'),('COUNTER','Counters',2,NULL,NULL,0,1,NULL,NULL,NULL,NULL,1,'DH001','2019-09-29 12:01:52','DH001','2019-09-29 12:01:52'),('COUNTRY','Country',1,10,NULL,0,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 23:29:02','DH001','2019-10-09 23:29:02'),('CURRENCY_CODE','Currency code',1,3,NULL,3,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-21 00:03:39','DH001','2019-10-21 00:03:39'),('CUSTOMER_NO','Customer Number',1,30,NULL,2,NULL,NULL,NULL,'customer','r_retail_customer',8,'DH001','2019-10-20 12:17:05','DH001','2019-10-21 23:10:30'),('CUSTOMER_TYPE','Customer type',1,10,NULL,3,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 11:52:32','DH001','2019-10-20 11:52:32'),('DATE','Date',7,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-09-29 12:09:15','DH001','2019-09-29 12:09:15'),('DATE_FORMAT','Date Format',2,NULL,NULL,3,NULL,NULL,NULL,NULL,NULL,4,'DH001','2019-10-09 23:10:45','DH001','2019-10-12 13:03:26'),('DECIMAL_FORMAT','Decimal format',2,NULL,NULL,3,NULL,NULL,NULL,NULL,NULL,2,'DH001','2019-10-09 22:52:06','DH001','2019-10-12 13:02:29'),('DEPARTMENT_ID','Department ID',1,20,NULL,0,NULL,1,NULL,NULL,NULL,1,'DH001','2019-10-09 23:16:32','DH001','2019-10-09 23:16:32'),('EMAIL','Email address',1,200,NULL,1,NULL,NULL,'^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$',NULL,NULL,6,'DH001','2019-09-29 11:43:43','DH001','2019-10-12 12:50:12'),('EMAIL_TYPE','Email type',1,10,NULL,3,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-10 23:00:10','DH001','2019-10-10 23:00:10'),('GENDER','Gender',1,10,NULL,3,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-09-29 11:54:19','DH001','2019-09-29 11:54:19'),('GUID','Object GUID',1,32,NULL,0,NULL,1,NULL,NULL,NULL,1,'DH001','2019-10-05 10:49:31','DH001','2019-10-05 10:49:31'),('HEIGHT','Height',4,3,2,0,NULL,NULL,NULL,NULL,NULL,4,'DH001','2019-10-09 21:17:03','DH001','2019-10-12 21:42:57'),('HUMAN_AGE','Age of human',2,NULL,NULL,4,NULL,NULL,NULL,NULL,NULL,2,'DH001','2019-09-29 13:34:05','DH001','2019-09-29 13:52:33'),('INTEGER','Signed integer in 4 bytes',2,NULL,NULL,0,0,NULL,NULL,NULL,NULL,1,'DH001','2019-09-29 12:06:53','DH001','2019-09-29 12:06:53'),('LANGUAGE_CODE','Language Code',1,6,NULL,3,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 22:49:41','DH001','2019-10-09 22:49:41'),('LOGICAL_SYSTEM','A Logical system',1,20,NULL,0,NULL,1,NULL,NULL,NULL,1,'DH001','2019-10-09 21:10:12','DH001','2019-10-09 21:10:12'),('MATERIAL_ID','Material ID',1,40,NULL,2,NULL,NULL,NULL,'material','r_goods',4,'DH001','2019-10-20 11:34:53','DH001','2019-10-21 23:15:33'),('MATERIAL_TYPE','Material type',1,10,NULL,3,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 11:48:40','DH001','2019-10-20 11:48:40'),('NAME','Name of an object',1,64,NULL,0,NULL,1,NULL,NULL,NULL,1,'DH001','2019-09-29 11:58:54','DH001','2019-09-29 11:58:54'),('NUMBER','Natural Number',2,NULL,NULL,0,1,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 11:31:52','DH001','2019-10-20 11:31:52'),('ORDER_TYPE','Order type',1,10,NULL,3,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 10:33:49','DH001','2019-10-20 10:33:49'),('PERSON_TYPE','Employee',1,10,NULL,3,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 21:06:10','DH001','2019-10-09 21:06:10'),('POSITION_TITLE','Position title',1,64,NULL,0,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 23:13:33','DH001','2019-10-09 23:13:33'),('POSTCODE','Postcode',1,10,NULL,1,NULL,NULL,'^[0-9]*$',NULL,NULL,1,'DH001','2019-10-09 23:26:00','DH001','2019-10-09 23:26:00'),('PWD_STATE','Password State',2,NULL,NULL,3,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-10 23:29:45','DH001','2019-10-10 23:29:45'),('QUANTITY','Quantity',4,23,4,0,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 11:37:14','DH001','2019-10-20 11:37:14'),('TEXT','TEXT without length limit',5,NULL,NULL,1,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-09-29 12:08:11','DH001','2019-09-29 12:08:11'),('TIMESTAMP','Timestamp in general',8,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-09-29 12:09:33','DH001','2019-09-29 12:09:33'),('TIMEZONE','Timezone',1,10,NULL,3,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 23:08:59','DH001','2019-10-09 23:08:59'),('UNIT','Unit',1,10,NULL,3,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 11:39:09','DH001','2019-10-20 11:39:09'),('USER_ID','User ID in the system',1,10,NULL,2,NULL,NULL,NULL,'person','r_user',3,'DH001','2019-09-29 11:41:17','DH001','2019-10-13 13:12:22');
/*!40000 ALTER TABLE `DATA_DOMAIN` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DATA_DOMAIN_VALUE`
--

DROP TABLE IF EXISTS `DATA_DOMAIN_VALUE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DATA_DOMAIN_VALUE` (
  `DOMAIN_ID` char(32) NOT NULL,
  `LOW_VALUE` char(10) NOT NULL,
  `HIGH_VALUE` char(10) DEFAULT NULL,
  PRIMARY KEY (`DOMAIN_ID`,`LOW_VALUE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DATA_DOMAIN_VALUE`
--

LOCK TABLES `DATA_DOMAIN_VALUE` WRITE;
/*!40000 ALTER TABLE `DATA_DOMAIN_VALUE` DISABLE KEYS */;
INSERT INTO `DATA_DOMAIN_VALUE` VALUES ('ADDRESS_TYPE','CLIVE',''),('ADDRESS_TYPE','WORK',''),('CURRENCY_CODE','AUS',''),('CURRENCY_CODE','CAD',''),('CURRENCY_CODE','CNY',''),('CURRENCY_CODE','EUR',''),('CURRENCY_CODE','JPY',''),('CURRENCY_CODE','USD',''),('CUSTOMER_TYPE','RETAIL',''),('CUSTOMER_TYPE','WHOLE',''),('DATE_FORMAT','0',''),('DATE_FORMAT','1',''),('DATE_FORMAT','2',''),('DATE_FORMAT','3',''),('DECIMAL_FORMAT','1',''),('DECIMAL_FORMAT','2',''),('EMAIL_TYPE','PRIVATE',''),('EMAIL_TYPE','WORK',''),('GENDER','Female',''),('GENDER','Male',''),('GENDER','Unknown',''),('HUMAN_AGE','1','200'),('INTEGER','1','100'),('LANGUAGE_CODE','EN',''),('LANGUAGE_CODE','ZH',''),('MATERIAL_TYPE','GOODS',''),('MATERIAL_TYPE','PRODUCT',''),('MATERIAL_TYPE','RAW',''),('MATERIAL_TYPE','SEMI-PROD',''),('MATERIAL_TYPE','SERVICE',''),('ORDER_TYPE','DELIVER',''),('ORDER_TYPE','PURCHASE',''),('ORDER_TYPE','SALES',''),('PERSON_TYPE','contract',''),('PERSON_TYPE','employee',''),('PERSON_TYPE','others',''),('PWD_STATE','0',''),('PWD_STATE','1',''),('PWD_STATE','2',''),('TIMEZONE','UTC+0',''),('TIMEZONE','UTC+1',''),('TIMEZONE','UTC+10',''),('TIMEZONE','UTC+11',''),('TIMEZONE','UTC+2',''),('TIMEZONE','UTC+3',''),('TIMEZONE','UTC+4',''),('TIMEZONE','UTC+5',''),('TIMEZONE','UTC+6',''),('TIMEZONE','UTC+7',''),('TIMEZONE','UTC+8',''),('TIMEZONE','UTC+9',''),('UNIT','EA',''),('UNIT','G',''),('UNIT','KG',''),('UNIT','PC','');
/*!40000 ALTER TABLE `DATA_DOMAIN_VALUE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DATA_DOMAIN_VALUE_TEXT`
--

DROP TABLE IF EXISTS `DATA_DOMAIN_VALUE_TEXT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DATA_DOMAIN_VALUE_TEXT` (
  `DOMAIN_ID` char(32) NOT NULL,
  `LOW_VALUE` char(10) NOT NULL,
  `LANGU` char(5) NOT NULL,
  `LOW_VALUE_TEXT` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`DOMAIN_ID`,`LANGU`,`LOW_VALUE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DATA_DOMAIN_VALUE_TEXT`
--

LOCK TABLES `DATA_DOMAIN_VALUE_TEXT` WRITE;
/*!40000 ALTER TABLE `DATA_DOMAIN_VALUE_TEXT` DISABLE KEYS */;
INSERT INTO `DATA_DOMAIN_VALUE_TEXT` VALUES ('ADDRESS_TYPE','CLIVE','EN','Current live address'),('ADDRESS_TYPE','WORK','EN','Work address'),('CURRENCY_CODE','AUS','EN',''),('CURRENCY_CODE','CAD','EN',''),('CURRENCY_CODE','CNY','EN',''),('CURRENCY_CODE','EUR','EN',''),('CURRENCY_CODE','JPY','EN',''),('CURRENCY_CODE','USD','EN',''),('CUSTOMER_TYPE','RETAIL','EN','Retail Customer'),('CUSTOMER_TYPE','WHOLE','EN','Whole Sale Customer'),('DATE_FORMAT','0','EN','YYYYMMDD'),('DATE_FORMAT','1','EN','YYYY.MM.DD'),('DATE_FORMAT','2','EN','YYYY/MM/DD'),('DATE_FORMAT','3','EN','YYYY-MM-DD'),('DECIMAL_FORMAT','1','EN','10,000.00'),('DECIMAL_FORMAT','2','EN','10.000,00'),('EMAIL_TYPE','PRIVATE','EN','Private'),('EMAIL_TYPE','WORK','EN','Work'),('GENDER','Female','EN','Female'),('GENDER','Male','EN','Male'),('GENDER','Unknown','EN','Not clear or binsexual'),('HUMAN_AGE','1','EN','I haven\'t seen anyone who is age 201'),('INTEGER','1','EN',''),('LANGUAGE_CODE','EN','EN','English'),('LANGUAGE_CODE','ZH','EN','Chinese'),('MATERIAL_TYPE','GOODS','EN','Goods'),('MATERIAL_TYPE','PRODUCT','EN','Product'),('MATERIAL_TYPE','RAW','EN','Raw material'),('MATERIAL_TYPE','SEMI-PROD','EN','Semi-product'),('MATERIAL_TYPE','SERVICE','EN','Service'),('ORDER_TYPE','DELIVER','EN','Deliver Order'),('ORDER_TYPE','PURCHASE','EN','Purchase Order'),('ORDER_TYPE','SALES','EN','Sales Order'),('PERSON_TYPE','contract','EN','Contract'),('PERSON_TYPE','employee','EN','Employee'),('PERSON_TYPE','others','EN','Others'),('PWD_STATE','0','EN','Initial'),('PWD_STATE','1','EN','Active'),('PWD_STATE','2','EN','Expired'),('TIMEZONE','UTC+0','EN',''),('TIMEZONE','UTC+1','EN',''),('TIMEZONE','UTC+10','EN',''),('TIMEZONE','UTC+11','EN',''),('TIMEZONE','UTC+2','EN',''),('TIMEZONE','UTC+3','EN',''),('TIMEZONE','UTC+4','EN',''),('TIMEZONE','UTC+5','EN',''),('TIMEZONE','UTC+6','EN',''),('TIMEZONE','UTC+7','EN',''),('TIMEZONE','UTC+8','EN',''),('TIMEZONE','UTC+9','EN',''),('UNIT','EA','EN','Each'),('UNIT','G','EN','Gram'),('UNIT','KG','EN','Kilogram'),('UNIT','PC','EN','Piece');
/*!40000 ALTER TABLE `DATA_DOMAIN_VALUE_TEXT` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DATA_ELEMENT`
--

DROP TABLE IF EXISTS `DATA_ELEMENT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DATA_ELEMENT` (
  `ELEMENT_ID` char(32) NOT NULL,
  `ELEMENT_DESC` varchar(256) DEFAULT NULL,
  `DOMAIN_ID` char(32) DEFAULT NULL,
  `DATA_TYPE` int(4) DEFAULT NULL,
  `DATA_LENGTH` int(4) DEFAULT NULL,
  `DECIMAL` int(2) DEFAULT NULL,
  `SEARCH_HELP_ID` char(32) DEFAULT NULL,
  `SEARCH_HELP_EXPORT_FIELD` varchar(60) DEFAULT NULL,
  `PARAMETER_ID` char(60) DEFAULT NULL,
  `VERSION_NO` int(11) unsigned DEFAULT NULL,
  `CREATE_BY` varchar(32) DEFAULT NULL,
  `CREATE_TIME` datetime DEFAULT NULL,
  `LAST_CHANGE_BY` varchar(32) DEFAULT NULL,
  `LAST_CHANGE_TIME` datetime DEFAULT NULL,
  PRIMARY KEY (`ELEMENT_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DATA_ELEMENT`
--

LOCK TABLES `DATA_ELEMENT` WRITE;
/*!40000 ALTER TABLE `DATA_ELEMENT` DISABLE KEYS */;
INSERT INTO `DATA_ELEMENT` VALUES ('ADDRESS','Address',NULL,1,256,NULL,NULL,NULL,NULL,3,'DH001','2019-10-09 23:20:57','DH001','2019-10-11 21:51:33'),('ADDRESS_ID','Address ID','COUNTER',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 23:19:08','DH001','2019-10-09 23:19:08'),('ADDRESS_TYPE','Address type','ADDRESS_TYPE',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 23:23:24','DH001','2019-10-09 23:23:24'),('AGE','Age','HUMAN_AGE',NULL,NULL,NULL,NULL,NULL,NULL,2,'DH001','2019-09-29 12:14:19','DH001','2019-09-29 13:46:14'),('AMOUNT','Amount in general',NULL,4,23,2,NULL,NULL,NULL,1,'DH001','2019-09-29 11:35:31','DH001','2019-09-29 11:35:31'),('AMOUNT_LC','Amount in local currency','AMOUNT',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-09-29 15:07:02','DH001','2019-09-29 15:07:02'),('APP_ID','Application ID','APP_ID',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 22:18:17','DH001','2019-10-09 22:18:17'),('APP_NAME','Application Name',NULL,1,64,NULL,NULL,NULL,NULL,3,'DH001','2019-10-09 22:13:10','DH001','2019-10-09 22:16:28'),('BILL_TO_PARTY','The person or organization who receives the bill','CUSTOMER_NO',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 23:12:56','DH001','2019-10-20 23:12:56'),('BINARY','Binary in general',NULL,6,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-09-29 11:38:33','DH001','2019-09-29 11:38:33'),('BIRTHDAY','Birthday',NULL,7,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-12 23:05:42','DH001','2019-10-12 23:05:42'),('BOOLEAN','Boolean in general',NULL,3,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-09-29 11:36:07','DH001','2019-09-29 11:36:07'),('CATEGORY_NAME','Category Name',NULL,1,120,NULL,NULL,NULL,NULL,2,'DH001','2019-10-09 22:09:07','DH001','2019-10-09 22:17:42'),('CELL_PHONE_NUMBER','Cell phone number','CELL_PHONE_NUMBER',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 19:32:36','DH001','2019-10-20 19:32:36'),('CHANGED_BY','The user who changed the entity','USER_ID',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 10:50:38','DH001','2019-10-20 10:50:38'),('CHANGE_TIME','Time when an object is changed','TIMESTAMP',NULL,NULL,NULL,NULL,NULL,NULL,3,'DH001','2019-10-07 21:30:19','DH001','2019-10-07 21:38:54'),('CITY','City','CITY',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 23:28:33','DH001','2019-10-09 23:28:33'),('COMPANY_ID','Company ID','COMPANY_ID',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 23:15:37','DH001','2019-10-09 23:15:37'),('COUNTRY','Country','COUNTRY',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 23:29:22','DH001','2019-10-09 23:29:22'),('CREATED_BY','The user who created the entity','USER_ID',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 10:53:08','DH001','2019-10-20 10:53:08'),('CREATE_TIME','Time when the object is created','TIMESTAMP',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-09-29 12:16:33','DH001','2019-09-29 12:16:33'),('CREDIT','Customer credit','NUMBER',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 19:41:55','DH001','2019-10-20 19:41:55'),('CURRENCY_CODE','Currency Code','CURRENCY_CODE',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-21 00:04:31','DH001','2019-10-21 00:04:31'),('CUSTOMER_NAME','Customer name',NULL,1,64,NULL,NULL,NULL,NULL,5,'DH001','2019-10-20 19:11:50','DH001','2019-10-21 20:32:48'),('CUSTOMER_NO','Customer Number','CUSTOMER_NO',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 12:19:35','DH001','2019-10-20 12:19:35'),('CUSTOMER_TYPE','Customer type','CUSTOMER_TYPE',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 11:53:08','DH001','2019-10-20 11:53:08'),('DATE','Date in general',NULL,7,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-09-29 11:39:25','DH001','2019-09-29 11:39:25'),('DATE_FORMAT','Date format','DATE_FORMAT',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 23:11:11','DH001','2019-10-09 23:11:11'),('DECIMAL_FORMAT','Decimal format','DECIMAL_FORMAT',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 23:07:09','DH001','2019-10-09 23:07:09'),('DEPARTMENT_ID','Department ID','DEPARTMENT_ID',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 23:17:07','DH001','2019-10-09 23:17:07'),('DESCRIPTION_MEDIUM','Medium description is less than 200.',NULL,1,200,NULL,NULL,NULL,NULL,1,'DH001','2019-09-29 11:34:29','DH001','2019-09-29 11:34:29'),('DESCRIPTION_SHORT','Short description is less than 100 chars',NULL,1,100,NULL,NULL,NULL,NULL,2,'DH001','2019-09-29 11:28:46','DH001','2019-09-29 11:33:42'),('DESCRIPTION_UNLIMIT','Description is no length limit',NULL,5,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-09-29 11:38:00','DH001','2019-09-29 11:38:00'),('DISPLAY_NAME','Display Name',NULL,1,128,NULL,NULL,NULL,NULL,2,'DH001','2019-10-10 23:12:42','DH001','2019-10-10 23:18:57'),('EFFECTIVE_DATE','Effective Date','DATE',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-09-29 12:17:08','DH001','2019-09-29 12:17:08'),('EMAIL','Email','EMAIL',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-10 23:08:22','DH001','2019-10-10 23:08:22'),('EMAIL_TYPE','Email type','EMAIL_TYPE',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-10 23:03:26','DH001','2019-10-10 23:03:26'),('ENTITY_ID','Entity ID',NULL,1,32,NULL,NULL,NULL,NULL,1,'DH001','2019-10-05 10:51:39','DH001','2019-10-05 10:51:39'),('FAMILY_NAME','Family Name',NULL,1,64,NULL,NULL,NULL,NULL,1,'DH001','2019-10-10 23:26:34','DH001','2019-10-10 23:26:34'),('GENDER','Gender','GENDER',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-09-29 12:12:59','DH001','2019-09-29 12:12:59'),('GIVEN_NAME','Given Name',NULL,1,64,NULL,NULL,NULL,NULL,1,'DH001','2019-10-10 23:25:37','DH001','2019-10-10 23:25:37'),('HEIGHT','Height','HEIGHT',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 21:17:26','DH001','2019-10-09 21:17:26'),('HOBBY','Hobbies',NULL,1,60,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 21:06:51','DH001','2019-10-09 21:06:51'),('INSTANCE_GUID','Instance GUID','GUID',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-05 10:52:03','DH001','2019-10-05 10:52:03'),('INTEGER','4 bytes integer in general',NULL,2,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-09-29 11:36:40','DH001','2019-09-29 11:36:40'),('LANGUAGE_CODE','Language Code','LANGUAGE_CODE',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 22:50:21','DH001','2019-10-09 22:50:21'),('LOGICAL_SYSTEM','Software Logical System','LOGICAL_SYSTEM',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 21:10:47','DH001','2019-10-09 21:10:47'),('MATERIAL_DESC','Material description',NULL,1,200,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 19:13:35','DH001','2019-10-20 19:13:35'),('MATERIAL_ID','Material ID','MATERIAL_ID',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 11:35:29','DH001','2019-10-20 11:35:29'),('MATERIAL_TYPE','Material type','MATERIAL_TYPE',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 11:49:07','DH001','2019-10-20 11:49:07'),('MIDDLE_NAME','Middle Name',NULL,1,64,NULL,NULL,NULL,NULL,1,'DH001','2019-10-10 23:26:06','DH001','2019-10-10 23:26:06'),('ORDER','Order or sequence no','COUNTER',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-11 21:52:30','DH001','2019-10-11 21:52:30'),('ORDER_ITEM_NO','Order item number','NUMBER',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 11:32:26','DH001','2019-10-20 11:32:26'),('ORDER_NO','Order Number','COUNTER',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 11:31:01','DH001','2019-10-20 11:31:01'),('ORDER_TYPE','Order type','ORDER_TYPE',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 10:41:12','DH001','2019-10-20 10:41:12'),('PASSWORD','Password(Encrypted)',NULL,1,64,NULL,NULL,NULL,NULL,1,'DH001','2019-10-10 23:27:59','DH001','2019-10-10 23:27:59'),('PAY_TO_PARTY','The person or organization who pay the bill. Usually the back, or payment companies.','CUSTOMER_NO',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 23:13:49','DH001','2019-10-20 23:13:49'),('PERSON_TYPE','Type of a person','PERSON_TYPE',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 21:20:53','DH001','2019-10-09 21:20:53'),('POSITION_TITLE','Position title','POSITION_TITLE',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 23:14:02','DH001','2019-10-09 23:14:02'),('POSTCODE','Postcode','POSTCODE',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 23:26:23','DH001','2019-10-09 23:26:23'),('PRICE','Price','AMOUNT',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 11:40:53','DH001','2019-10-20 11:40:53'),('PRIMARY','Is primary','BOOLEAN',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-11 21:53:45','DH001','2019-10-11 21:53:45'),('PWD_STATE','Password state','PWD_STATE',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-10 23:30:18','DH001','2019-10-10 23:30:18'),('QUANTITY','Quantity','QUANTITY',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 11:37:37','DH001','2019-10-20 11:37:37'),('ROLE_NAME','Role Name','NAME',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-09-29 12:13:36','DH001','2019-09-29 12:13:36'),('ROUTE_LINK','Portal relative navigation link',NULL,1,120,NULL,NULL,NULL,NULL,2,'DH001','2019-10-09 22:19:14','DH001','2019-10-09 22:19:53'),('SHIP_TO_PARTY','The person or organization who take the stock delivery','CUSTOMER_NO',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 23:12:12','DH001','2019-10-20 23:12:12'),('SOLD_TO_PARTY','The person or organization who place the order','CUSTOMER_NO',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 23:11:27','DH001','2019-10-20 23:11:27'),('TEXT','General text ','TEXT',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-09-29 12:15:38','DH001','2019-09-29 12:15:38'),('TIMESTAMP','Timestamp in general',NULL,8,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-09-29 11:39:44','DH001','2019-09-29 11:39:44'),('TIMEZONE','Timezone','TIMEZONE',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-09 23:09:37','DH001','2019-10-09 23:09:37'),('UNIT','Unit','UNIT',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-20 11:39:34','DH001','2019-10-20 11:39:34'),('USER_ID','User ID','USER_ID',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-09-29 12:12:13','DH001','2019-09-29 12:12:13'),('USER_LOCK','Whether the user is locked','BOOLEAN',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-10 23:25:09','DH001','2019-10-10 23:25:09'),('USER_NAME','User Name','NAME',NULL,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-10 23:11:54','DH001','2019-10-10 23:11:54'),('VALID_FROM','Valid from timestamp',NULL,8,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-05 10:59:23','DH001','2019-10-05 10:59:23'),('VALID_TO','Valid to',NULL,8,NULL,NULL,NULL,NULL,NULL,1,'DH001','2019-10-05 10:59:40','DH001','2019-10-05 10:59:40'),('VERSION_NO','Object version number','COUNTER',NULL,NULL,NULL,NULL,NULL,NULL,3,'DH001','2019-09-29 12:15:01','DH001','2019-10-04 22:11:57');
/*!40000 ALTER TABLE `DATA_ELEMENT` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DATA_ELEMENT_TEXT`
--

DROP TABLE IF EXISTS `DATA_ELEMENT_TEXT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DATA_ELEMENT_TEXT` (
  `ELEMENT_ID` char(32) NOT NULL,
  `LANGU` char(5) NOT NULL,
  `LABEL_TEXT` varchar(45) DEFAULT NULL,
  `LIST_HEADER_TEXT` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`ELEMENT_ID`,`LANGU`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DATA_ELEMENT_TEXT`
--

LOCK TABLES `DATA_ELEMENT_TEXT` WRITE;
/*!40000 ALTER TABLE `DATA_ELEMENT_TEXT` DISABLE KEYS */;
INSERT INTO `DATA_ELEMENT_TEXT` VALUES ('ADDRESS','EN','Address','Address'),('ADDRESS_ID','EN','Address ID','Address ID'),('ADDRESS_TYPE','EN','Address Type','Address type'),('AGE','EN','Age','Age'),('AMOUNT','EN','Amount','Amount'),('AMOUNT_LC','EN','Amount in local currency','Amount LC'),('APP_ID','EN','App ID','App ID'),('APP_NAME','EN','App Name','App Name'),('BILL_TO_PARTY','EN','Bill-to Party','Bill-to Party'),('BINARY','EN','Binary','Binary'),('BIRTHDAY','EN','Birthday','Birthday'),('BOOLEAN','EN','Boolean','Boolean'),('CATEGORY_NAME','EN','Category Name','Category Name'),('CELL_PHONE_NUMBER','EN','Cell Phone','Phone'),('CHANGED_BY','EN','Changed by','Changed by'),('CHANGE_TIME','EN','Change Time','Change Time'),('CITY','EN','City','City'),('COMPANY_ID','EN','Company ID','Company ID'),('COUNTRY','EN','Country','Country'),('CREATED_BY','EN','Created by','Created by'),('CREATE_TIME','EN','Create Time','Create Time'),('CREDIT','EN','Credit','Credit'),('CURRENCY_CODE','EN','Currency Code','Currency Code'),('CUSTOMER_NAME','EN','Customer Name','Customer Name'),('CUSTOMER_NO','EN','Customer Number','Customer'),('CUSTOMER_TYPE','EN','Customer Type','Type'),('DATE','EN','Date','Date'),('DATE_FORMAT','EN','Date Format','Date Format'),('DECIMAL_FORMAT','EN','Decimal Format','Decimal Format'),('DEPARTMENT_ID','EN','Department ID','Department ID'),('DESCRIPTION_MEDIUM','EN','Medium description','Descr'),('DESCRIPTION_SHORT','EN','Short Description','Descr'),('DESCRIPTION_UNLIMIT','EN','Description','Descr'),('DISPLAY_NAME','EN','Display Name','Display Name'),('EFFECTIVE_DATE','EN','Effective Date','Effective Date'),('EMAIL','EN','Email','Email'),('EMAIL_TYPE','EN','Email Type','Email Type'),('ENTITY_ID','EN','Entity ID','Entity'),('FAMILY_NAME','EN','Family Name','Family Name'),('GENDER','EN','Gender','Gender'),('GIVEN_NAME','EN','Given Name','Given Name'),('HEIGHT','EN','Height','Height'),('HOBBY','EN','Hobbies','Hobbies'),('INSTANCE_GUID','EN','Instance GUID','Instance GUID'),('INTEGER','EN','Integer','Integer'),('LANGUAGE_CODE','EN','Language ','Language '),('LOGICAL_SYSTEM','EN','Logical System','Logical System'),('MATERIAL_DESC','EN','Material Description','Material Desc'),('MATERIAL_ID','EN','Material ID','Material'),('MATERIAL_TYPE','EN','Material Type','Type'),('MIDDLE_NAME','EN','Middle Name','Middle Name'),('ORDER','EN','Order','Order'),('ORDER_ITEM_NO','EN','Item Number','Item Number'),('ORDER_NO','EN','Order Number','Order Number'),('ORDER_TYPE','EN','Order Type','Type'),('PASSWORD','EN','Password','Password'),('PAY_TO_PARTY','EN','Pay-to Party','Pay-to Party'),('PERSON_TYPE','EN','Person Type','Person Type'),('POSITION_TITLE','EN','Title','Title'),('POSTCODE','EN','Postcode','Postcode'),('PRICE','EN','Price','Price'),('PRIMARY','EN','Primary','Primary'),('PWD_STATE','EN','Password State','Password State'),('QUANTITY','EN','Quantity','Quantity'),('ROLE_NAME','EN','Role Name','Role Name'),('ROUTE_LINK','EN','Nav Link','Nav Link'),('SHIP_TO_PARTY','EN','Ship-to Party','Ship-to Party'),('SOLD_TO_PARTY','EN','Sold-to Party','Sold-to Party'),('TEXT','EN','Text','Text'),('TIMESTAMP','EN','Timestamp','Timestamp'),('TIMEZONE','EN','Timezone','Timezone'),('UNIT','EN','Unit','Unit'),('USER_ID','EN','User ID','User ID'),('USER_LOCK','EN','Locked','Locked'),('USER_NAME','EN','User Name','User Name'),('VALID_FROM','EN','Valid from','Valid from'),('VALID_TO','EN','Valid to','Valid to'),('VERSION_NO','EN','Version','Version');
/*!40000 ALTER TABLE `DATA_ELEMENT_TEXT` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ENTITY`
--

DROP TABLE IF EXISTS `ENTITY`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ENTITY` (
  `ENTITY_ID` varchar(32) NOT NULL,
  `ENTITY_DESC` varchar(256) DEFAULT NULL,
  `VERSION_NO` int(11) unsigned DEFAULT NULL,
  `RELOAD_IND` int(11) unsigned DEFAULT '0' COMMENT 'Check whether the meta should be reloaded into the cache of a Node process',
  `CREATE_BY` varchar(32) DEFAULT NULL,
  `CREATE_TIME` datetime DEFAULT NULL,
  `LAST_CHANGE_BY` varchar(32) DEFAULT NULL,
  `LAST_CHANGE_TIME` datetime DEFAULT NULL,
  PRIMARY KEY (`ENTITY_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Entity Defination';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ENTITY`
--

LOCK TABLES `ENTITY` WRITE;
/*!40000 ALTER TABLE `ENTITY` DISABLE KEYS */;
INSERT INTO `ENTITY` VALUES ('app','Application',16,1,'DH001','2019-01-21 21:58:19','DH001','2019-10-09 22:20:12'),('blog','DarkHouse Blogs',5,1,'DH001','2018-08-08 12:00:00','DH001','2019-07-06 15:36:30'),('category','A group, often named or numbered, to which items are assigned based on similarity or defined criteria.',3,1,'DH001','2019-01-22 22:17:05','DH001','2019-10-09 22:12:04'),('customer','Customer',4,2,'DH001','2019-10-20 18:58:44','DH001','2019-10-21 20:33:27'),('material','General Material: goods, products, services, raw material, semi-product, and so on.',4,1,'DH001','2019-10-20 18:56:31','DH001','2019-10-21 20:17:51'),('order','General order',4,2,'DH001','2019-10-20 11:22:45','DH001','2019-10-21 20:22:36'),('permission','System permission',4,1,'DH001','2019-01-23 22:55:10','DH001','2019-10-09 22:00:52'),('person','People Entity',24,45,'DH001','2018-08-08 12:00:00','DH001','2019-10-19 11:37:25');
/*!40000 ALTER TABLE `ENTITY` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ENTITY_INSTANCES`
--

DROP TABLE IF EXISTS `ENTITY_INSTANCES`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ENTITY_INSTANCES` (
  `ENTITY_ID` varchar(45) NOT NULL,
  `INSTANCE_GUID` varchar(32) NOT NULL COMMENT 'Record Guid',
  `DEL` tinyint(1) DEFAULT NULL COMMENT 'Deletion Flag',
  `CHANGE_NO` int(11) DEFAULT NULL,
  PRIMARY KEY (`ENTITY_ID`,`INSTANCE_GUID`),
  KEY `01` (`INSTANCE_GUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ENTITY_INSTANCES`
--

LOCK TABLES `ENTITY_INSTANCES` WRITE;
/*!40000 ALTER TABLE `ENTITY_INSTANCES` DISABLE KEYS */;
INSERT INTO `ENTITY_INSTANCES` VALUES ('app','364DAB906EFA11E98808DFA641575D74',0,1),('app','568822C02A0B11E98FB33576955DB73A',0,1),('app','680ED4802A0B11E98FB33576955DB73A',0,1),('app','830A7AE02A1611E9BBE39B9C6748A022',0,1),('app','ABAB7C202A0B11E98FB33576955DB73A',0,1),('app','B91A0D902A0B11E98FB33576955DB73A',0,1),('app','C349EEC02A0B11E98FB33576955DB73A',0,1),('app','F729EAB02A1511E9BBE39B9C6748A022',0,1),('blog','045BDD10779111E480CA0FE6F781342E',0,1),('blog','0D1A10206E6D11E4AB0AEF641C444556',1,1),('blog','457EC191CAD411E4B1DF1BCB230FDE71',1,1),('blog','45A036D0CAD511E4A5A0FFC9494713C8',1,1),('blog','4C34BC40730611E4BFD079EF5BB617D3',1,1),('blog','5AB96790721411E4BB4BDF940F0717E9',1,1),('blog','5EE0E7C0CAD511E495A27F461C67FEEA',1,1),('blog','64D44D31CAD411E49057ADAD973C829A',1,1),('blog','6F484A70F16F11E4ADBB3D6DE2A014D5',0,1),('blog','7E615950757511E4A9246D06B7949BB3',1,1),('blog','871252C0CAD411E4886A218E8A47B87A',1,1),('blog','8819B6F073BC11E4B22DCD14AD72434C',1,1),('blog','8C9E9E90721611E4BB4BDF940F0717E9',1,1),('blog','8F9342F0721511E4BB4BDF940F0717E9',1,1),('blog','90253750623E11E485C9E9300C5B65CF',0,1),('blog','96252EA06E6C11E4AB0AEF641C444556',1,1),('blog','9C212A0085ED11E487DF61A235EE544C',0,1),('blog','A015F230721511E4BB4BDF940F0717E9',1,1),('blog','AA18E490623E11E485C9E9300C5B65CF',0,1),('blog','B214CD31CAD511E4AEDA5DCCF11B56E4',1,1),('blog','B80543F0721511E4BB4BDF940F0717E9',1,1),('blog','C04911C0B3EE11E4B736F5F74BE2BA3D',0,1),('blog','D0338480757811E4A2F39559567F9248',1,1),('blog','DF933500779011E480CA0FE6F781342E',0,1),('blog','E000ACB095B411E49C0889967E3DEFD6',0,1),('blog','E18161F0721511E4BB4BDF940F0717E9',1,1),('blog','E652F2406E6711E4AB0AEF641C444556',1,1),('blog','FE7645E0E9E711E6B33BEB9E97AD1121',1,1),('blog_c','002DF130CF7D11E482CA674623ED2E5F',0,1),('blog_c','01610320D16311E4A1A15749592BDF30',0,1),('blog_c','044EB2B0CD7D11E4893D232DA720A0C0',0,1),('blog_c','051007E0CD7211E48774838AE2DBA458',0,1),('blog_c','06EA8DC0D16311E4A1A15749592BDF30',0,1),('blog_c','08971A60D16511E4B181BDAC6DCE62D6',0,1),('blog_c','090B7441CD7911E4853FC747A5D85C7A',0,1),('blog_c','0912E090CD7411E48C4EB18DFA5F06D4',0,1),('blog_c','0913F200CD7411E48C4EB18DFA5F06D4',0,1),('blog_c','0AA64B50D16511E4B181BDAC6DCE62D6',0,1),('blog_c','0F267C40D16511E4B181BDAC6DCE62D6',0,1),('blog_c','1106CA70D16411E4B181BDAC6DCE62D6',0,1),('blog_c','124CFEB0D16711E4B181BDAC6DCE62D6',0,1),('blog_c','19000110D15A11E486EBED7F9BF58BEF',0,1),('blog_c','19722950CD7411E4B688E7D7CEC56562',0,1),('blog_c','197388E0CD7411E4B688E7D7CEC56562',0,1),('blog_c','1FEC5330D15E11E4816891523278567C',0,1),('blog_c','208969C0CD7D11E4BF5FC9528E08494F',0,1),('blog_c','20B86AE0D16011E499F55B784C97896C',0,1),('blog_c','22848DA0CF1611E4BDF64FA38910341E',1,1),('blog_c','228AF641CF1611E4BDF64FA38910341E',0,1),('blog_c','2645BA80D16A11E4B181BDAC6DCE62D6',0,1),('blog_c','2C39FFC0D16811E4B181BDAC6DCE62D6',0,1),('blog_c','2ED04420CF7D11E482CA674623ED2E5F',1,1),('blog_c','30DA89F0D16811E4B181BDAC6DCE62D6',0,1),('blog_c','3130A710CD7411E4B2FAEB0D340FE6A0',0,1),('blog_c','3131B880CD7411E4B2FAEB0D340FE6A0',0,1),('blog_c','31753260D15F11E499F55B784C97896C',0,1),('blog_c','32256A80CD7811E49188174F34676093',0,1),('blog_c','38A8E000D15E11E4B62B856C8FA320A7',0,1),('blog_c','3A612A90CD7D11E493B39FE7180A063B',0,1),('blog_c','3E27B610CF0A11E4A990C9E14B8DC73D',0,1),('blog_c','3EDBA950D16611E4B181BDAC6DCE62D6',0,1),('blog_c','3F8379F0D5B711E4A182EB193BBD3E7D',0,1),('blog_c','4007AFE1CD7911E48D858D310228F35A',0,1),('blog_c','43377440D16411E4B181BDAC6DCE62D6',0,1),('blog_c','48EAACE0CF7511E491B2A1EC90A515CB',1,1),('blog_c','4A418BF0CF1511E4BBE4CF64410BB8BA',1,1),('blog_c','4A470A31CF1511E4BBE4CF64410BB8BA',0,1),('blog_c','4A59FF70CD7411E4B2147757BC837EA6',0,1),('blog_c','4A5AE9D0CD7411E4B2147757BC837EA6',0,1),('blog_c','4B911450CD7E11E4B9F8EB448085C13B',1,1),('blog_c','4D4DACC0CF1011E4AD60AF5E01484D2E',1,1),('blog_c','542D93E0D16611E4B181BDAC6DCE62D6',0,1),('blog_c','54EBF240CD7E11E4AD9CCFBE5410D584',1,1),('blog_c','54FCCC80CF7E11E485BBEB1BEB6F1B3B',1,1),('blog_c','55E84060D15F11E499F55B784C97896C',0,1),('blog_c','56519D30CF7511E498296FE1870A20D5',1,1),('blog_c','5BF70E50D16411E4B181BDAC6DCE62D6',0,1),('blog_c','5DC890A0CF0C11E4ADEFE582F149BD0B',1,1),('blog_c','5E2F9E10D04411E48119E580EDBEC24F',1,1),('blog_c','5EB20761CD7911E4A16303BF07B4A127',0,1),('blog_c','5F0EBFA1CD7411E4866EAFAED945121A',0,1),('blog_c','5F7EAB40D16011E499F55B784C97896C',0,1),('blog_c','602E7670D16411E4B181BDAC6DCE62D6',0,1),('blog_c','61043490CFC511E48799995CB05B9A7F',1,1),('blog_c','613114903ABB11E59FAC77B696D1304F',1,1),('blog_c','613B26B13ABB11E59FAC77B696D1304F',0,1),('blog_c','61672C40D15E11E4A4D497C5BA126531',0,1),('blog_c','6420A0C0CF0A11E4A2FAB353707BEB91',0,1),('blog_c','64CDCE10CF7511E4BD4E4D1E887C7500',1,1),('blog_c','67946B50CF7911E482CA674623ED2E5F',0,1),('blog_c','67CD12A0CD7811E4805E49081EB621EC',0,1),('blog_c','69DD4F80D15E11E4B5B3DD5C60BE0DF5',0,1),('blog_c','6D0BA340CF7511E4A8E4052C95EC1745',1,1),('blog_c','6E120640D16311E49801A3A4AE734C90',0,1),('blog_c','6F4044D1CD7811E493A889C794979374',0,1),('blog_c','70C0BC00CF7511E4B51813823BB90534',1,1),('blog_c','717EDE80CF0A11E4B8D937927984CF5D',0,1),('blog_c','72DEA220D16611E4B181BDAC6DCE62D6',0,1),('blog_c','73E2DA70D16011E499F55B784C97896C',0,1),('blog_c','762B4610CE3A11E49498D14B51EF6258',1,1),('blog_c','76307631CE3A11E49498D14B51EF6258',0,1),('blog_c','782C50C0CE3B11E4A4721101377D40E1',1,1),('blog_c','782FFA41CE3B11E4A4721101377D40E1',0,1),('blog_c','7CCFCCA0D16611E4B181BDAC6DCE62D6',0,1),('blog_c','83B223F0CF0A11E4B6DCD50DFB156F17',1,1),('blog_c','84890CB0D15F11E499F55B784C97896C',0,1),('blog_c','84E2E2A0D04511E4AB3C5B24B0CD5666',0,1),('blog_c','863581C0CF7E11E485BBEB1BEB6F1B3B',1,1),('blog_c','86FDB960D16311E48A7FB95DA59E6670',0,1),('blog_c','8927C980D15C11E4B3239F7B7DCC11F2',1,1),('blog_c','8B8B34F0D15C11E4B3239F7B7DCC11F2',1,1),('blog_c','8B8B53C0CD7111E4B44A1724542E32D6',0,1),('blog_c','921ED530D15F11E499F55B784C97896C',0,1),('blog_c','95D3D3B0CE3A11E4BCB13B9DF7AD03F1',1,1),('blog_c','95D72F11CE3A11E4BCB13B9DF7AD03F1',0,1),('blog_c','966766F0D04411E48119E580EDBEC24F',0,1),('blog_c','98D02E50CE3B11E4A786555EC35E36B4',1,1),('blog_c','98D3D7D1CE3B11E4A786555EC35E36B4',0,1),('blog_c','99CEE770CD7C11E4AAB5E165BD0BAE95',0,1),('blog_c','A313F9B0CF0C11E4B668F121CA749C4F',1,1),('blog_c','A6471DC0D16811E4B181BDAC6DCE62D6',0,1),('blog_c','A6B5CCD0D16211E4A1A15749592BDF30',0,1),('blog_c','A8AD26A0CF0A11E4B3AEB9B7563B4FC0',1,1),('blog_c','ABB0BE20CF1411E4AC8EAFEEFBDD90E7',1,1),('blog_c','ABB92291CF1411E4AC8EAFEEFBDD90E7',0,1),('blog_c','AD35E940D15E11E4B3239F7B7DCC11F2',0,1),('blog_c','AE000520D16011E499F55B784C97896C',0,1),('blog_c','AF099230CF7911E482CA674623ED2E5F',0,1),('blog_c','B1461CC0D5B011E494CA61E91F024143',0,1),('blog_c','BB133FA0CF7D11E482CA674623ED2E5F',1,1),('blog_c','BC1F7BC0CF0A11E4AB632DCC1B530096',1,1),('blog_c','BEC306D0D16211E4A1A15749592BDF30',0,1),('blog_c','C2285510D16611E4B181BDAC6DCE62D6',0,1),('blog_c','C4EA4E70D21A11E4B181BDAC6DCE62D6',0,1),('blog_c','CC3073F0E9C711E6853B917BEA847AFB',1,1),('blog_c','CC569990E9C711E6853B917BEA847AFB',0,1),('blog_c','D1F8F4A0E9CD11E686E88177B070BA5B',1,1),('blog_c','D212E540E9CD11E686E88177B070BA5B',0,1),('blog_c','D392E6C0CF0A11E4BAEAC78A3A1F29DC',1,1),('blog_c','D5D14430D15E11E499F55B784C97896C',0,1),('blog_c','DD7B99B0D16311E4B181BDAC6DCE62D6',0,1),('blog_c','DDD662F0CE3911E48ED8AB04245CA3F9',1,1),('blog_c','DDD9E561CE3911E48ED8AB04245CA3F9',0,1),('blog_c','DF1257A0436411E58A735FF1D7B60553',1,1),('blog_c','DF19F8C1436411E58A735FF1D7B60553',0,1),('blog_c','E3007C80CF0A11E4B5E991FF153AFABD',1,1),('blog_c','E31B71F0CD7211E4A29B37A1A83C0FA8',0,1),('blog_c','E5AC7DF0D16011E499F55B784C97896C',0,1),('blog_c','E7C7DBC0D5B111E494CA61E91F024143',0,1),('blog_c','E8FF6D10CD7C11E4AE0A2D9BDEE68693',0,1),('blog_c','E96F7960D16011E499F55B784C97896C',0,1),('blog_c','EA11C410CFC411E485BBEB1BEB6F1B3B',1,1),('blog_c','EB3E1F10CF1411E4B2940144A215E381',1,1),('blog_c','EB454B01CF1411E4B2940144A215E381',0,1),('blog_c','EDDB1740D16811E4B181BDAC6DCE62D6',0,1),('blog_c','F1C34790D16011E499F55B784C97896C',0,1),('blog_c','F20BA180D22C11E4B181BDAC6DCE62D6',0,1),('blog_c','F21696D0CD7211E4B498ED84D2A4EBC6',0,1),('category','3B37C1F029DA11E9AC5E594C14A66283',0,1),('category','3D9D0AE02A1611E9BBE39B9C6748A022',0,1),('category','87676B0029D711E9AC5E594C14A66283',0,1),('category','B16516702A1611E9BBE39B9C6748A022',0,1),('category','E273E94029D911E9AC5E594C14A66283',0,1),('customer','21B3F670F4DE11E99E406180136CE0E4',0,1),('customer','EBA0F460F35311E98F6A9F800EA12272',0,1),('material','950BE290F35311E98F6A9F800EA12272',0,1),('material','B9DA9A90F35211E98F6A9F800EA12272',0,1),('mtestEntity','114A5F00F6AA11E8BB091B5EA31165A2',0,1),('mtestEntity2','57750F10F6AB11E8BB091B5EA31165A2',0,1),('order','5CBF79C0F4D311E997501D1A99C0C387',0,1),('order','94FA7D50F4DB11E99A39795F1E41AB73',0,1),('order','D2B7C740F4DD11E9A8BD29964292B968',0,1),('permission','23F3AE905E8311E9A91C03500E3C8091',0,1),('permission','391E75B02A1811E981F3C33C6FB0A7C1',0,1),('permission','466E8EF0012111E985BC9505494F6FA7',0,1),('permission','4E1760A000E011E99661DDEF647C9347',0,1),('permission','AF7E5550E7E511E992DC7BC6FE1F471B',0,1),('permission','F66BEAE000E111E98F7FCBD7CE013F34',0,1),('permission','FE4F278000E211E9A3B973A1C93CBFFC',0,1),('permission','FE5008B0012011E985BC9505494F6FA7',0,1),('person','1A4EB21F9CE0B3236F61EDBB57BC9738',0,1),('person','2FBE7490E10F11E8A90957FA46F2CECA',0,1),('person','430C8BB0E1C611E8877F9D5C9668A7A3',0,1),('person','92DC9FD0586E11E9BAC45F443A808A26',1,1),('person','AF9536D058D911E9B422FD1CF966218C',0,1),('person','B99348C0336D11E9820805351193F8B8',0,1),('person','D25AAC90587011E9B861C1960CC84A32',1,1),('person','EB5658E0E10911E8B743BDBC73B06EDF',1,1),('user','21FF7AE0CD7011E4981899FCDB4C29BC',0,1),('user','2DC36990CD7011E4BFCBF71B8996D687',0,1),('user','331321BE893BAD23BCE7D4CCB157D5AD',0,1),('user','642E38AF1F3E184B5182F707E8C0FD00',0,1),('user','65451011E9ADD168718EEA917EFBFB81',0,1),('user','7FD22560CD6F11E483264D84524F730D',0,1),('user','B13F5820CD6F11E4ACED61CD9852248B',0,1),('user','CE781E40CD6F11E4B3D191641ECE6F2E',0,1),('user','D0BDC880CD6F11E48B16A72AD2357D7B',0,1),('user','DB6DAFD80D66D60E486B593AF92A6F2B',0,1),('user','ECAF3700CD6E11E490C45DA8A552F8B7',0,1);
/*!40000 ALTER TABLE `ENTITY_INSTANCES` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ENTITY_ROLES`
--

DROP TABLE IF EXISTS `ENTITY_ROLES`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ENTITY_ROLES` (
  `ENTITY_ID` varchar(32) NOT NULL,
  `ROLE_ID` varchar(45) NOT NULL,
  `CONDITIONAL_ATTR` varchar(60) DEFAULT NULL COMMENT 'The role assignment is only effective when the conditional attribute equal or with in the conditional value(s)',
  `CONDITIONAL_VALUE` varchar(512) DEFAULT NULL COMMENT 'The role assignment is only effective when the conditional attribute equal or with in the conditional value(s)',
  PRIMARY KEY (`ENTITY_ID`,`ROLE_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ENTITY_ROLES`
--

LOCK TABLES `ENTITY_ROLES` WRITE;
/*!40000 ALTER TABLE `ENTITY_ROLES` DISABLE KEYS */;
INSERT INTO `ENTITY_ROLES` VALUES ('app','portal_app',NULL,NULL),('blog','allowComment',NULL,NULL),('category','app_category',NULL,NULL),('customer','retail_customer','TYPE','RETAIL'),('material','goods','TYPE','GOODS'),('mtestEntity','mtestRole01',NULL,NULL),('mtestEntity2','mtestRole02',NULL,NULL),('order','sales_order','TYPE','SALES'),('permission','system_role',NULL,NULL),('person','employee','TYPE','employee'),('person','husband','GENDER','Male, Unknown'),('person','system_user','SYSTEM_ACCESS','PORTAL'),('person','wife','GENDER','Female, Unknown');
/*!40000 ALTER TABLE `ENTITY_ROLES` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RELATION`
--

DROP TABLE IF EXISTS `RELATION`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `RELATION` (
  `RELATION_ID` char(32) NOT NULL,
  `RELATION_DESC` varchar(256) DEFAULT NULL,
  `VERSION_NO` int(11) unsigned DEFAULT NULL,
  `RELOAD_IND` int(11) unsigned DEFAULT NULL COMMENT 'Check whether the meta should be reloaded into the cache of a Node process',
  `CREATE_BY` varchar(32) DEFAULT NULL,
  `CREATE_TIME` datetime DEFAULT NULL,
  `LAST_CHANGE_BY` varchar(32) DEFAULT NULL,
  `LAST_CHANGE_TIME` datetime DEFAULT NULL,
  PRIMARY KEY (`RELATION_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RELATION`
--

LOCK TABLES `RELATION` WRITE;
/*!40000 ALTER TABLE `RELATION` DISABLE KEYS */;
INSERT INTO `RELATION` VALUES ('app','Application',16,2,'DH001','2019-01-21 21:58:19','DH001','2019-10-09 22:20:12'),('blog','DarkHouse Blogs',5,1,'DH001','2018-12-02 17:10:31','DH001','2019-07-06 15:36:30'),('category','A group, often named or numbered, to which items are assigned based on similarity or defined criteria.',3,3,'DH001','2019-01-22 22:17:05','DH001','2019-10-09 22:12:04'),('customer','Customer',4,13,'DH001','2019-10-20 18:58:44','DH001','2019-10-21 20:33:27'),('material','General Material: goods, products, services, raw material, semi-product, and so on.',4,5,'DH001','2019-10-20 18:56:31','DH001','2019-10-21 20:17:51'),('mtestEntity','Manual Test Entity1',2,1,'DH001','2018-12-02 18:08:21','DH001','2018-12-09 18:43:08'),('mtestEntity2','Manual Test Entity 2',2,1,'DH001','2018-12-02 18:50:08','DH001','2019-01-11 22:59:54'),('order','General order',4,3,'DH001','2019-10-20 11:22:45','DH001','2019-10-21 20:22:36'),('permission','System permission',4,2,'DH001','2019-01-23 22:55:10','DH001','2019-10-09 22:00:52'),('person','person entity defualt relation',19,6,'DH001','2018-11-01 19:50:35','DH001','2019-10-19 11:37:25'),('rs_app_category','Assign apps to a application category',6,2,'DH001','2019-01-22 22:22:05','DH001','2019-10-11 21:52:53'),('rs_marriage','Marriage btw 2 persons',7,2,'DH001','2018-11-01 19:50:35','DH001','2019-10-11 21:51:39'),('rs_mtest01','Manual Test',1,1,'DH001','2018-12-02 20:00:52','DH001','2018-12-02 20:00:52'),('rs_mtest02',NULL,22,1,'DH001','2019-04-08 21:46:34','DH001','2019-04-10 22:57:20'),('rs_system_role_category','A system role contains multiple categories',9,2,'DH001','2019-01-23 23:00:31','DH001','2019-10-11 21:52:43'),('rs_user_role','A system user has multiple system roles ',4,2,'DH001','2018-11-01 19:50:35','DH001','2019-10-11 21:51:56'),('r_address','System Logon User address',13,5,'DH001','2018-11-01 19:50:35','DH001','2019-10-11 21:54:08'),('r_app_category','App category groups apps',2,2,'DH001','2019-01-24 21:58:37','DH001','2019-10-09 22:23:28'),('r_comment','Comments',5,1,'DH001','2018-12-03 15:54:47','DH001','2018-12-03 18:53:55'),('r_company','Company',2,4,'DH001','2018-11-01 19:50:35','DH001','2019-10-10 23:34:53'),('r_email','System Logon User Email',7,7,'DH001','2018-11-01 19:50:35','DH001','2019-10-11 21:53:59'),('r_employee','Company Employee',3,6,'DH001','2018-11-01 19:50:35','DH001','2019-10-09 23:17:34'),('r_goods','Goods',7,10,'DH001','2019-10-20 19:19:07','DH001','2019-10-22 00:06:30'),('r_order_head','Order head',11,12,'DH001','2019-10-20 23:16:20','DH001','2019-10-22 20:57:24'),('r_order_item','Order item',10,13,'DH001','2019-10-20 11:42:55','DH001','2019-10-21 21:14:37'),('r_personalization','System Logon User Personalization',3,6,'DH001','2018-11-01 19:50:35','DH001','2019-10-09 23:11:47'),('r_retail_customer','Retail customer',4,11,'DH001','2019-10-20 19:33:24','DH001','2019-10-22 00:10:11'),('r_role','System Role',9,2,'DH001','2018-11-01 19:50:35','DH001','2019-10-09 22:46:19'),('r_user','System Logon User',5,5,'DH001','2018-11-01 19:50:35','DH001','2019-10-10 23:30:38');
/*!40000 ALTER TABLE `RELATION` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RELATIONSHIP`
--

DROP TABLE IF EXISTS `RELATIONSHIP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `RELATIONSHIP` (
  `RELATIONSHIP_ID` varchar(32) NOT NULL COMMENT 'The ID of a relationship, not GUID! always begin with ‘r_’.',
  `RELATIONSHIP_DESC` varchar(256) DEFAULT NULL COMMENT 'The Relationship Type: Weak/Regular.',
  `VALID_PERIOD` int(11) unsigned DEFAULT NULL COMMENT 'The valid period of the relationship(in seconds)',
  `VERSION_NO` int(11) unsigned DEFAULT NULL,
  `CREATE_BY` varchar(32) DEFAULT NULL,
  `CREATE_TIME` datetime DEFAULT NULL,
  `LAST_CHANGE_BY` varchar(32) DEFAULT NULL,
  `LAST_CHANGE_TIME` datetime DEFAULT NULL,
  PRIMARY KEY (`RELATIONSHIP_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Relationships among 2 or more entities. Here, always week relationships, like husband and wife in a marriage.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RELATIONSHIP`
--

LOCK TABLES `RELATIONSHIP` WRITE;
/*!40000 ALTER TABLE `RELATIONSHIP` DISABLE KEYS */;
INSERT INTO `RELATIONSHIP` VALUES ('rs_app_category','Assign apps to a application category',0,6,'DH001','2019-01-22 22:22:05','DH001','2019-10-11 21:52:53'),('rs_marriage','Marriage btw 2 persons',315360000,7,'DH001','2018-11-18 19:50:35','DH001','2019-10-11 21:51:39'),('rs_system_role_category','A system role contains multiple categories',NULL,9,'DH001','2019-01-23 23:00:31','DH001','2019-10-11 21:52:43'),('rs_user_role','A system user has multiple system roles ',0,4,'DH001','2018-11-18 19:50:35','DH001','2019-10-11 21:51:56');
/*!40000 ALTER TABLE `RELATIONSHIP` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RELATIONSHIP_INVOLVES`
--

DROP TABLE IF EXISTS `RELATIONSHIP_INVOLVES`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `RELATIONSHIP_INVOLVES` (
  `RELATIONSHIP_ID` varchar(32) NOT NULL,
  `ROLE_ID` varchar(32) NOT NULL COMMENT 'Role involved in the relationship. For example, husband in marriage',
  `CARDINALITY` varchar(6) DEFAULT NULL COMMENT '[1..1] maximum 1 and at least 1\n[1..n] minimum 1 ant multiple',
  `DIRECTION` varchar(128) DEFAULT NULL COMMENT 'Relationship direction',
  PRIMARY KEY (`RELATIONSHIP_ID`,`ROLE_ID`),
  KEY `INVOLVES` (`ROLE_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RELATIONSHIP_INVOLVES`
--

LOCK TABLES `RELATIONSHIP_INVOLVES` WRITE;
/*!40000 ALTER TABLE `RELATIONSHIP_INVOLVES` DISABLE KEYS */;
INSERT INTO `RELATIONSHIP_INVOLVES` VALUES ('rs_app_category','app_category','[1..n]','Contains'),('rs_app_category','portal_app','[1..n]','Belongs'),('rs_blog_comments','blog','[1..1]','has'),('rs_blog_comments','blog_comment','[1..n]','belong to'),('rs_marriage','husband','[1..1]','is husband of'),('rs_marriage','wife','[1..1]','is wife of'),('rs_system_role_category','app_category','[1..n]','Belongs'),('rs_system_role_category','system_role','[1..n]','Contains'),('rs_user_role','system_role','[1..n]','is assigned to'),('rs_user_role','system_user','[1..n]','has');
/*!40000 ALTER TABLE `RELATIONSHIP_INVOLVES` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RELATION_ASSOCIATION`
--

DROP TABLE IF EXISTS `RELATION_ASSOCIATION`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `RELATION_ASSOCIATION` (
  `LEFT_RELATION_ID` varchar(32) NOT NULL COMMENT 'Relation(table) in the left side, as the SQL join in the logical left position. ',
  `ASSOCIATION_NAME` varchar(32) NOT NULL,
  `RIGHT_RELATION_ID` varchar(32) DEFAULT NULL COMMENT 'Relation(table) in the right side, as the SQL join in the logical right position. ',
  `CARDINALITY` varchar(6) DEFAULT NULL COMMENT '[0..1] can be null, or maximum 1 for the right relation\n[1..1] maximum 1 and at least 1 for the right relation\n[0..n] can be null, or multiple for the right relation\n[1..n] minimum 1 and multiple for the right relation',
  `FOREIGN_KEY_CHECK` tinyint(1) DEFAULT NULL COMMENT 'Whether do foreign key check on the right relation when insert values into the left relation',
  PRIMARY KEY (`LEFT_RELATION_ID`,`ASSOCIATION_NAME`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Relations can be associated with each other. For example, header and items, which have the association with cardinality [1..n].\nThe cardinality here should always be [1..1] and [1..n], as the associations are always reflect strong relationships. ';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RELATION_ASSOCIATION`
--

LOCK TABLES `RELATION_ASSOCIATION` WRITE;
/*!40000 ALTER TABLE `RELATION_ASSOCIATION` DISABLE KEYS */;
INSERT INTO `RELATION_ASSOCIATION` VALUES ('r_employee','r_company','r_company','[1..1]',1),('r_order_head','bill_to_party','r_retail_customer','[0..1]',0),('r_order_head','pay_to_party','r_retail_customer','[0..1]',0),('r_order_head','r_order_item','r_order_item','[0..n]',0),('r_order_head','ship_to_party','r_retail_customer','[0..1]',0),('r_order_head','sold_to_party','r_retail_customer','[1..1]',1),('r_order_item','r_goods','r_goods','[1..1]',1),('r_order_item','r_order_head','r_order_head','[1..1]',1),('r_user','r_employee','r_employee','[0..1]',0),('r_user','r_personalization','r_personalization','[0..1]',0);
/*!40000 ALTER TABLE `RELATION_ASSOCIATION` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RELATION_ASSOCIATION_FIELDS_MAPPING`
--

DROP TABLE IF EXISTS `RELATION_ASSOCIATION_FIELDS_MAPPING`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `RELATION_ASSOCIATION_FIELDS_MAPPING` (
  `LEFT_RELATION_ID` varchar(32) NOT NULL,
  `ASSOCIATION_NAME` varchar(32) NOT NULL,
  `LEFT_FIELD` varchar(45) NOT NULL,
  `RIGHT_FIELD` varchar(45) NOT NULL,
  PRIMARY KEY (`LEFT_RELATION_ID`,`ASSOCIATION_NAME`,`LEFT_FIELD`,`RIGHT_FIELD`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RELATION_ASSOCIATION_FIELDS_MAPPING`
--

LOCK TABLES `RELATION_ASSOCIATION_FIELDS_MAPPING` WRITE;
/*!40000 ALTER TABLE `RELATION_ASSOCIATION_FIELDS_MAPPING` DISABLE KEYS */;
INSERT INTO `RELATION_ASSOCIATION_FIELDS_MAPPING` VALUES ('r_employee','r_company','COMPANY_ID','COMPANY_ID'),('r_order_head','bill_to_party','BILL_TO_PARTY','CUSTOMER_NO'),('r_order_head','pay_to_party','PAY_TO_PARTY','CUSTOMER_NO'),('r_order_head','r_order_item','ORDER_NO','ORDER_NO'),('r_order_head','ship_to_party','SHIP_TO_PARTY','CUSTOMER_NO'),('r_order_head','sold_to_party','SOLD_TO_PARTY','CUSTOMER_NO'),('r_order_item','r_goods','MATERIAL_ID','MATERIAL_ID'),('r_order_item','r_order_head','ORDER_NO','ORDER_NO'),('r_user','r_employee','USER_ID','USER_ID'),('r_user','r_personalization','USER_ID','USER_ID');
/*!40000 ALTER TABLE `RELATION_ASSOCIATION_FIELDS_MAPPING` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ROLE`
--

DROP TABLE IF EXISTS `ROLE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ROLE` (
  `ROLE_ID` varchar(32) NOT NULL COMMENT 'ROLE ID',
  `ROLE_DESC` varchar(256) DEFAULT NULL,
  `VERSION_NO` int(11) unsigned DEFAULT NULL,
  `CREATE_BY` varchar(32) DEFAULT NULL,
  `CREATE_TIME` datetime DEFAULT NULL,
  `LAST_CHANGE_BY` varchar(32) DEFAULT NULL,
  `LAST_CHANGE_TIME` datetime DEFAULT NULL,
  PRIMARY KEY (`ROLE_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Roles perform a relationship. For example, husband and wife together forms the marriage';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ROLE`
--

LOCK TABLES `ROLE` WRITE;
/*!40000 ALTER TABLE `ROLE` DISABLE KEYS */;
INSERT INTO `ROLE` VALUES ('allowComment','Allow Commenting',6,'DH001','2018-12-03 15:55:45','DH001','2018-12-03 17:39:51'),('app_category','Groups related app together',3,'DH001','2019-01-22 22:19:02','DH001','2019-02-06 14:20:46'),('employee','Company Employee',2,'DH001','2018-11-01 19:50:35','DH001','2019-06-09 21:48:05'),('goods','Goods',1,'DH001','2019-10-20 19:21:19','DH001','2019-10-20 19:21:19'),('husband','Husband',1,'DH001','2018-11-01 19:50:35','DH001','2018-11-01 19:50:35'),('portal_app','Application that can be accessed via portal',1,'DH001','2019-01-21 22:22:20','DH001','2019-01-21 22:22:20'),('retail_customer','Retail customer',2,'DH001','2019-10-20 19:34:01','DH001','2019-10-20 19:34:51'),('sales_order','Sales order',2,'DH001','2019-10-20 19:05:41','DH001','2019-10-20 23:17:14'),('system_role','System user role',1,'DH001','2018-11-01 19:50:35','DH001','2018-11-01 19:50:35'),('system_user','System user for login',2,'DH001','2018-11-01 19:50:35','DH001','2019-06-09 21:48:20'),('wife','Wife',9,'DH001','2018-11-01 19:50:35','DH001','2019-07-06 15:39:22');
/*!40000 ALTER TABLE `ROLE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ROLE_RELATION`
--

DROP TABLE IF EXISTS `ROLE_RELATION`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ROLE_RELATION` (
  `ROLE_ID` varchar(32) NOT NULL,
  `RELATION_ID` varchar(32) NOT NULL,
  `CARDINALITY` varchar(6) DEFAULT NULL COMMENT '[0..1] can be null, maximum 1\n[0..n] can be null or multiple\n[1..1] 1 and at least 1\n[1..n] multiple and at least 1',
  PRIMARY KEY (`ROLE_ID`,`RELATION_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ROLE_RELATION`
--

LOCK TABLES `ROLE_RELATION` WRITE;
/*!40000 ALTER TABLE `ROLE_RELATION` DISABLE KEYS */;
INSERT INTO `ROLE_RELATION` VALUES ('allowComment','r_comment','[0..n]'),('app_category','r_app_category','[1..1]'),('employee','r_address','[0..n]'),('employee','r_email','[1..n]'),('employee','r_employee','[1..1]'),('goods','r_goods','[1..1]'),('retail_customer','r_address','[1..n]'),('retail_customer','r_retail_customer','[1..1]'),('sales_order','r_order_head','[1..1]'),('sales_order','r_order_item','[0..n]'),('system_role','r_role','[1..1]'),('system_user','r_personalization','[0..1]'),('system_user','r_user','[1..1]');
/*!40000 ALTER TABLE `ROLE_RELATION` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `app`
--

DROP TABLE IF EXISTS `app`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `app` (
  `INSTANCE_GUID` varchar(32) NOT NULL,
  `APP_ID` varchar(32) DEFAULT NULL COMMENT '9B530A701D8411E9988095837A47C01E',
  `ROUTE_LINK` varchar(120) DEFAULT NULL COMMENT '9B5331811D8411E9988095837A47C01E',
  `NAME` varchar(64) DEFAULT NULL COMMENT '187E22E02ACE11E99A2D1B6606150BCA',
  `IS_EXTERNAL` tinyint(4) DEFAULT NULL COMMENT '8CDFEDA02BA311E9BD55195C94C6A6A5',
  PRIMARY KEY (`INSTANCE_GUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app`
--

LOCK TABLES `app` WRITE;
/*!40000 ALTER TABLE `app` DISABLE KEYS */;
INSERT INTO `app` VALUES ('364DAB906EFA11E98808DFA641575D74','users','/users','User Management',NULL),('568822C02A0B11E98FB33576955DB73A','Modeling','/jor/model/entity-type','Modeling',1),('680ED4802A0B11E98FB33576955DB73A','EntityBrowser','/jor/entity/list','Entity Browser',1),('830A7AE02A1611E9BBE39B9C6748A022','Dashboard','/mockup/dashboard','Dashboard',NULL),('ABAB7C202A0B11E98FB33576955DB73A','Bubble','/dashboard','D4 Bubble',NULL),('B91A0D902A0B11E98FB33576955DB73A','HandsonTable','/handsontable','Handson Table',NULL),('C349EEC02A0B11E98FB33576955DB73A','blog','https://darkhouse.com.cn/blog/list','Darkhouse Blog',1),('F729EAB02A1511E9BBE39B9C6748A022','Search','/appSearch','Search',NULL);
/*!40000 ALTER TABLE `app` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog`
--

DROP TABLE IF EXISTS `blog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `blog` (
  `INSTANCE_GUID` varchar(32) NOT NULL,
  `AUTHOR` varchar(64) DEFAULT NULL COMMENT '238549CD9FDA471EBF1FA98CE9E9A702',
  `ID` int(11) DEFAULT NULL COMMENT '5299ED5694B542DF9FBC9EBDF19D3D15',
  `NUM_READS` int(11) DEFAULT NULL COMMENT '54D87DCF56604EE0B94D736E89A51F68',
  `PUBLISHED` tinyint(1) DEFAULT NULL COMMENT '6536A71833B54CBE9EF0A95938E9CFC0',
  `PUBLISH_TIME` datetime DEFAULT NULL COMMENT '99B95A18333541319DAD743F7FB9BFD1',
  `TITLE` varchar(128) DEFAULT NULL COMMENT 'AB16FF7FA38C46B1B2F9F55A3380FAC5',
  `ABSTRACT` varchar(256) DEFAULT NULL COMMENT 'E49BF959EF2B47CE8E6820F648C7468D',
  `NAME` varchar(64) DEFAULT NULL COMMENT 'EAD0E0F1E4E147A99DA2FA1F9CB24FA3',
  PRIMARY KEY (`INSTANCE_GUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog`
--

LOCK TABLES `blog` WRITE;
/*!40000 ALTER TABLE `blog` DISABLE KEYS */;
INSERT INTO `blog` VALUES ('045BDD10779111E480CA0FE6F781342E','VINCEZK',94,30,1,'2014-11-29 14:29:05','Choose Your Weapon','\"Make a choice\" is difficult, especially there are lots of web technologies, like: PHP, Ruby, JAVA, JavaScript, ASP, and so on.','blog2.html'),('6F484A70F16F11E4ADBB3D6DE2A014D5','VINCEZK',229,157,1,'2015-05-03 16:36:03','NoSQL数据模型','介绍NoSQL的文章不计其数，然而大多是围绕其性能、扩展性以及可用性等方面。本文将从数据模型角度描述当前流行的几种NoSQL数据库类型， 并将它们同关系型模型作对比。','DataBase-NoSQL.html'),('90253750623E11E485C9E9300C5B65CF','VinceZK',1,NULL,NULL,'2014-10-30 00:00:00','Compose Your First Single Page Application','If you want to compose a web application, you must consider following stuff...','blog1.html'),('9C212A0085ED11E487DF61A235EE544C','VINCEZK',95,51,1,'2014-12-17 21:07:10','抓住长尾的架构策略','这是黑屋博客的首篇，但这是一篇翻译之作。我把它设为开篇是由于它能很好的引出黑屋后面的内容。','SaaS_OverView.html'),('AA18E490623E11E485C9E9300C5B65CF','VinceZK',2,NULL,0,'2014-10-30 00:00:00','Compose Your First Single Page Application','If you want to compose a web application, you must consider following stuff...aa','blog1.html'),('C04911C0B3EE11E4B736F5F74BE2BA3D','VINCEZK',99,790,1,'2015-02-14 10:11:13','OLAP浪潮','到上世纪80年代末，关系型数据库已经积累了将近10年的数据了。一方面，数据量的上升总会带来性能的下降；另一方面，数据量的上升带来更多的数据分析需求。这2者加在一起，使得摩尔定律带来的硬件性能提升变得杯水车薪......','DataBase-OLAP.html'),('DF933500779011E480CA0FE6F781342E','VINCEZK',92,7,1,'2014-11-29 14:28:03','制造一个互联网应用','随着移动互联网时代的到来，各行各业都加入到移动互联大军中来。但几乎每个企业都会经历一段“大跃进”时期，就像上面发生的对话一样，仿佛进入移动互联只需要一个App，而这个App很轻松就能得到.','blog1.html'),('E000ACB095B411E49C0889967E3DEFD6','VINCEZK',98,276,1,'2015-01-06 23:01:21','一切皆关系','前文谈到开发SaaS最大的挑战是实现一个可扩展的多租户数据模型，黑屋对此深有同感，因此准备在接下来的几篇博客中详细介绍黑屋的多租户数据模型，我们将之称为Multi-Tenancy DB(MDB)......','DataBase-Relational_Model.html');
/*!40000 ALTER TABLE `blog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `category` (
  `INSTANCE_GUID` varchar(32) NOT NULL,
  `NAME` varchar(120) DEFAULT NULL COMMENT '65588DB01E5011E986CD5503AC4FFAF2',
  PRIMARY KEY (`INSTANCE_GUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES ('3B37C1F029DA11E9AC5E594C14A66283','User Management'),('3D9D0AE02A1611E9BBE39B9C6748A022','Demo'),('87676B0029D711E9AC5E594C14A66283','Search'),('B16516702A1611E9BBE39B9C6748A022','Blog'),('E273E94029D911E9AC5E594C14A66283','Model');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customer` (
  `INSTANCE_GUID` varchar(32) NOT NULL,
  `TYPE` varchar(10) DEFAULT NULL COMMENT '9580ABF1F32811E9AB756F2008E0531B',
  `CREATED_BY` varchar(10) DEFAULT NULL COMMENT '9580ABF2F32811E9AB756F2008E0531B',
  `CREATE_TIME` datetime DEFAULT NULL COMMENT '9580ABF3F32811E9AB756F2008E0531B',
  `CHANGED_BY` varchar(10) DEFAULT NULL COMMENT '9580ABF4F32811E9AB756F2008E0531B',
  `CHANGE_TIME` datetime DEFAULT NULL COMMENT '9580ABF5F32811E9AB756F2008E0531B',
  `CUSTOMER_NAME` varchar(64) DEFAULT NULL COMMENT '7A0A6B70F32A11E9AB756F2008E0531B',
  PRIMARY KEY (`INSTANCE_GUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES ('21B3F670F4DE11E99E406180136CE0E4','RETAIL','DH001','2019-10-21 23:59:00','DH001','2019-10-21 23:00:00','Chocolate LOVER'),('EBA0F460F35311E98F6A9F800EA12272','RETAIL','DH001','2019-10-21 23:59:00','DH001','2019-10-21 23:00:00','SWEET LOVER');
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material`
--

DROP TABLE IF EXISTS `material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `material` (
  `INSTANCE_GUID` varchar(32) NOT NULL,
  `MATERIAL_DESC` varchar(200) DEFAULT NULL COMMENT '464996A0F32811E9AB756F2008E0531B',
  `TYPE` varchar(10) DEFAULT NULL COMMENT '464996A1F32811E9AB756F2008E0531B',
  `CREATED_BY` varchar(10) DEFAULT NULL COMMENT '464996A2F32811E9AB756F2008E0531B',
  `CREATE_TIME` datetime DEFAULT NULL COMMENT '464996A3F32811E9AB756F2008E0531B',
  `CHANGED_BY` varchar(10) DEFAULT NULL COMMENT '464996A4F32811E9AB756F2008E0531B',
  `CHANGE_TIME` datetime DEFAULT NULL COMMENT '464996A5F32811E9AB756F2008E0531B',
  PRIMARY KEY (`INSTANCE_GUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material`
--

LOCK TABLES `material` WRITE;
/*!40000 ALTER TABLE `material` DISABLE KEYS */;
INSERT INTO `material` VALUES ('950BE290F35311E98F6A9F800EA12272','Chocolate(M0002)','GOODS','DH001','2019-10-21 03:03:00','DH001','2019-10-21 03:20:00'),('B9DA9A90F35211E98F6A9F800EA12272','M0001','GOODS','DH001','2019-10-21 03:03:00','DH001','2019-10-21 03:03:00');
/*!40000 ALTER TABLE `material` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order` (
  `INSTANCE_GUID` varchar(32) NOT NULL,
  `TYPE` varchar(10) DEFAULT NULL COMMENT 'E2165680F2E811E9AB756F2008E0531B',
  `CREATED_BY` varchar(10) DEFAULT NULL COMMENT 'E2167D90F2E811E9AB756F2008E0531B',
  `CREATE_TIME` datetime DEFAULT NULL COMMENT 'E2167D91F2E811E9AB756F2008E0531B',
  `CHANGED_BY` varchar(10) DEFAULT NULL COMMENT 'E2167D92F2E811E9AB756F2008E0531B',
  `CHANGE_TIME` datetime DEFAULT NULL COMMENT 'E2167D93F2E811E9AB756F2008E0531B',
  `REMARK` text COMMENT '771EBF50F3FD11E98F6A9F800EA12272',
  PRIMARY KEY (`INSTANCE_GUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES ('5CBF79C0F4D311E997501D1A99C0C387','SALES','DH001','2019-10-22 22:39:21','DH001','2019-10-22 22:39:21','Some candies and chocolates'),('94FA7D50F4DB11E99A39795F1E41AB73','SALES','DH001','2019-10-22 22:51:51','DH001','2019-10-22 22:51:51','Some candies and chocolates'),('D2B7C740F4DD11E9A8BD29964292B968','SALES','DH001','2019-10-22 22:51:51','DH001','2019-10-22 22:51:51','Some candies and chocolates');
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permission` (
  `INSTANCE_GUID` varchar(32) NOT NULL,
  `DESCR` varchar(100) DEFAULT NULL COMMENT 'A2F08640A71311E99FEEC5535E8C2F7B',
  PRIMARY KEY (`INSTANCE_GUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
INSERT INTO `permission` VALUES ('23F3AE905E8311E9A91C03500E3C8091','Tester'),('391E75B02A1811E981F3C33C6FB0A7C1','System administrator'),('AF7E5550E7E511E992DC7BC6FE1F471B','Everyone');
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `person`
--

DROP TABLE IF EXISTS `person`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `person` (
  `INSTANCE_GUID` varchar(32) NOT NULL,
  `GENDER` varchar(10) DEFAULT NULL COMMENT '6C357AF2BE7B3FC9D4EB39424D2F541B',
  `HEIGHT` decimal(3,2) DEFAULT NULL COMMENT '13976E0B39AEBAFBDC35764518DB72D9',
  `HOBBY` varchar(60) DEFAULT NULL COMMENT '10F62E043562EC6E2373E743F606EB2F',
  `FINGER_PRINT` varchar(60) DEFAULT NULL COMMENT 'E801A3631E3C43E128F397AF9B7174CF',
  `TYPE` varchar(10) DEFAULT NULL COMMENT '9796A7208A8F11E9B33AE323F41A492C',
  `SYSTEM_ACCESS` varchar(20) DEFAULT NULL COMMENT 'FF01C9708ABD11E9B33AE323F41A492C',
  `BIRTHDAY` date DEFAULT NULL COMMENT '89625B00ED0311E998AB6FE356EBA785',
  PRIMARY KEY (`INSTANCE_GUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `person`
--

LOCK TABLES `person` WRITE;
/*!40000 ALTER TABLE `person` DISABLE KEYS */;
INSERT INTO `person` VALUES ('2FBE7490E10F11E8A90957FA46F2CECA','Male',1.70,'Coding','ABABABA','employee','PORTAL','2019-10-03'),('430C8BB0E1C611E8877F9D5C9668A7A3','Female',1.64,'Drama','asdfasdfsadfasdf','employee','PORTAL',NULL),('B99348C0336D11E9820805351193F8B8','Male',1.91,'AAAbb',NULL,'employee','PORTAL',NULL);
/*!40000 ALTER TABLE `person` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `r_address`
--

DROP TABLE IF EXISTS `r_address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `r_address` (
  `ADDRESS_ID` int(11) NOT NULL AUTO_INCREMENT COMMENT '215398FA901E8696BD093A0E9CBA2C7C',
  `COUNTRY` varchar(45) DEFAULT NULL COMMENT '93CB473FC2C6D2E32BFE5E60E603934D',
  `CITY` varchar(45) DEFAULT NULL COMMENT '930EF6C283C8679EE43B291EA5C1A76C',
  `POSTCODE` int(11) DEFAULT NULL COMMENT '7B1EB846E932AD839D4ECE7462AD7F3D',
  `ADDRESS_VALUE` varchar(256) DEFAULT NULL COMMENT '6FE183B97FC0E7578051EBDB9EF5D5A4',
  `TYPE` varchar(45) DEFAULT NULL COMMENT '929116D53BF779DB2E0AC487971773D4',
  `PRIMARY` tinyint(1) DEFAULT NULL COMMENT 'B829F4E362527EAEA77A1316ED354BEA',
  `INSTANCE_GUID` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`ADDRESS_ID`),
  KEY `REC_GUID` (`INSTANCE_GUID`)
) ENGINE=InnoDB AUTO_INCREMENT=700 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `r_address`
--

LOCK TABLES `r_address` WRITE;
/*!40000 ALTER TABLE `r_address` DISABLE KEYS */;
INSERT INTO `r_address` VALUES (527,'China','Shanghai',201202,'Room #999, Building #99, XXX Road #999','CLIVE',1,'2FBE7490E10F11E8A90957FA46F2CECA'),(528,'China','Haimen',226126,'Village LeeZhoo','WORK',0,'2FBE7490E10F11E8A90957FA46F2CECA'),(689,'China','xxxx',200000,'xx Road ','CLIVE',1,'430C8BB0E1C611E8877F9D5C9668A7A3'),(690,'China','Shanghai',200000,'#300 xxx Road','CLIVE',1,'EBA0F460F35311E98F6A9F800EA12272'),(691,'China','Shanghai',200001,'#301 xxx Road','CLIVE',1,'21B3F670F4DE11E99E406180136CE0E4');
/*!40000 ALTER TABLE `r_address` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `r_app_category`
--

DROP TABLE IF EXISTS `r_app_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `r_app_category` (
  `NAME` varchar(120) NOT NULL COMMENT '257F84001FE011E99C440BB4C5374517',
  `ICON` varchar(64) DEFAULT NULL COMMENT '257F84011FE011E99C440BB4C5374517',
  `INSTANCE_GUID` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`NAME`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `r_app_category`
--

LOCK TABLES `r_app_category` WRITE;
/*!40000 ALTER TABLE `r_app_category` DISABLE KEYS */;
INSERT INTO `r_app_category` VALUES ('Blog','fas fa-link','B16516702A1611E9BBE39B9C6748A022'),('Demo','fas fa-dot-circle','3D9D0AE02A1611E9BBE39B9C6748A022'),('Model','fas fa-database','E273E94029D911E9AC5E594C14A66283'),('Search','fas fa-search','87676B0029D711E9AC5E594C14A66283'),('User Management','fas fa-id-card','3B37C1F029DA11E9AC5E594C14A66283');
/*!40000 ALTER TABLE `r_app_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `r_comment`
--

DROP TABLE IF EXISTS `r_comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `r_comment` (
  `COMMENT` varchar(256) DEFAULT NULL COMMENT 'B451CB90F6D011E88A0AB1CA91FA338B',
  `IP_ADDRESS` varchar(15) DEFAULT NULL COMMENT 'B451F2A0F6D011E88A0AB1CA91FA338B',
  `USER` varchar(64) DEFAULT NULL COMMENT 'B451F2A1F6D011E88A0AB1CA91FA338B',
  `SECTION_ID` varchar(10) DEFAULT NULL COMMENT 'B451F2A2F6D011E88A0AB1CA91FA338B',
  `SUBMIT_TIME` datetime DEFAULT NULL COMMENT 'B451F2A3F6D011E88A0AB1CA91FA338B',
  `INSTANCE_GUID` varchar(32) DEFAULT NULL,
  `COMMENT_GUID` varchar(32) NOT NULL COMMENT 'BA7C6ED0F6E911E8BA6405D0C7818287',
  PRIMARY KEY (`COMMENT_GUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `r_comment`
--

LOCK TABLES `r_comment` WRITE;
/*!40000 ALTER TABLE `r_comment` DISABLE KEYS */;
INSERT INTO `r_comment` VALUES ('Comment Test','10.0.1.1','VinceZK','3.1','2014-11-22 14:27:08','9C212A0085ED11E487DF61A235EE544C','002DF130CF7D11E482CA674623ED2E5F'),(NULL,'127.0.0.1','Anonymous','3','2015-03-23 21:46:28','C04911C0B3EE11E4B736F5F74BE2BA3D','01610320D16311E4A1A15749592BDF30'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 22:42:35','9C212A0085ED11E487DF61A235EE544C','044EB2B0CD7D11E4893D232DA720A0C0'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 21:23:52','9C212A0085ED11E487DF61A235EE544C','051007E0CD7211E48774838AE2DBA458'),(NULL,'127.0.0.1','Anonymous','3','2015-03-23 21:46:37','C04911C0B3EE11E4B736F5F74BE2BA3D','06EA8DC0D16311E4A1A15749592BDF30'),('adfkaslkdjf laskjflkasjdfasdf','127.0.0.1','Anonymous','7','2015-03-23 22:00:59','C04911C0B3EE11E4B736F5F74BE2BA3D','08971A60D16511E4B181BDAC6DCE62D6'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 22:14:05','9C212A0085ED11E487DF61A235EE544C','090B7441CD7911E4853FC747A5D85C7A'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 21:38:17','9C212A0085ED11E487DF61A235EE544C','0913F200CD7411E48C4EB18DFA5F06D4'),('Test Comment 2','10.0.0.1','Anonymous',NULL,'2018-12-23 20:00:00','6F484A70F16F11E4ADBB3D6DE2A014D5','09F9F7CA8BD04928952C86F576D82B2B'),('fasdfasdfa sdfasdf','127.0.0.1','Anonymous','7','2015-03-23 22:01:02','C04911C0B3EE11E4B736F5F74BE2BA3D','0AA64B50D16511E4B181BDAC6DCE62D6'),('到底是因为综合分析业务日志太有用了，还是因为它妨碍了记录业务日志的性能，使得OLAP能成为一个独立的概念？对于这个问题的答案也许每家企业在不同阶段都有不同的体会， 但Codd认为前者似乎才是最主要的原因，而那个时候他接受了Hyperion（BI厂商，已被O','127.0.0.1','Anonymous','7','2015-03-23 22:01:10','C04911C0B3EE11E4B736F5F74BE2BA3D','0F267C40D16511E4B181BDAC6DCE62D6'),('test',NULL,'Anonymous','3',NULL,'9C212A0085ED11E487DF61A235EE544C','0FE4EA6065154A06974F822DA5617DAD'),('逻辑上根据这两点得出这个结论似乎没有问题，然而如果把OLAP和OLTP放在同等地位，这又和事实不符（这可从两个类别的商业系统所占的市场份额得出）。 这里本质问题在于区分“数据记录”和“数据分析”到底哪个才是最基础的？数据为什么要被记录下来？那是因为第一是人','127.0.0.1','Anonymous','8.1','2015-03-23 21:54:04','C04911C0B3EE11E4B736F5F74BE2BA3D','1106CA70D16411E4B181BDAC6DCE62D6'),('ewrqe',NULL,'Anonymous','6',NULL,'9C212A0085ED11E487DF61A235EE544C','11D960D7E5BF4631B020E296D66FC079'),('简单的说把原来一个系统分成2个系统：一个专门负责日常的事务型操作，另一个专门负责管理分析型报表。这种做法虽然降低了每个系统的负担， 但是需要额外付出数据冗余和一致性上面的代价。好在分析型报表的实时性要求一般都不高，因此完成','127.0.0.1','Anonymous','7','2015-03-23 22:15:34','C04911C0B3EE11E4B736F5F74BE2BA3D','124CFEB0D16711E4B181BDAC6DCE62D6'),('adsfasdf','::1',NULL,'11','2018-12-25 14:52:18','9C212A0085ED11E487DF61A235EE544C','14940CC79DE24C41B8123BCD63BFEF2D'),('Test Title','127.0.0.1','Anonymous','4','2015-03-23 20:42:42','C04911C0B3EE11E4B736F5F74BE2BA3D','19000110D15A11E486EBED7F9BF58BEF'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 21:38:45','9C212A0085ED11E487DF61A235EE544C','19722950CD7411E4B688E7D7CEC56562'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 21:38:45','9C212A0085ED11E487DF61A235EE544C','197388E0CD7411E4B688E7D7CEC56562'),('Title Comment','::1','Anonymous','0','2018-12-25 12:18:46','6F484A70F16F11E4ADBB3D6DE2A014D5','1D714EE9C6C741BF8F54B3EF49390E95'),('Test comment','10.0.1.1','VinceZK','2','2015-03-23 21:11:32','9C212A0085ED11E487DF61A235EE544C','1FEC5330D15E11E4816891523278567C'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 22:43:22','9C212A0085ED11E487DF61A235EE544C','208969C0CD7D11E4BF5FC9528E08494F'),('Test OL','127.0.0.1','Anonymous','8.1','2015-03-23 21:25:52','C04911C0B3EE11E4B736F5F74BE2BA3D','20B86AE0D16011E499F55B784C97896C'),('Test comment','10.0.1.1','VinceZK','1','2015-03-20 23:31:10','9C212A0085ED11E487DF61A235EE544C','228AF641CF1611E4BDF64FA38910341E'),('kjhkjlkjlkjljl','127.0.0.1','Anonymous','13','2015-03-23 22:37:36','C04911C0B3EE11E4B736F5F74BE2BA3D','2645BA80D16A11E4B181BDAC6DCE62D6'),('Test Comment 9','10.0.0.1','Anonymous','1','2018-12-23 20:00:00','6F484A70F16F11E4ADBB3D6DE2A014D5','2C27AAB38F86465A99CF815317D10F25'),('就如同每个人的人生也不完全一样。 这中虚渺的联系给了算命先生足够的发挥空间','127.0.0.1','Anonymous','5','2015-03-23 22:23:27','C04911C0B3EE11E4B736F5F74BE2BA3D','2C39FFC0D16811E4B181BDAC6DCE62D6'),('那个时候充斥着诸如：数据仓库（Data Warehousing），数据集市（Data Mart），数据挖掘（Data Mining）等概念。 也许这些概念在一开始提出的时候，只是为了给某些已存在的计算机系统命名。','127.0.0.1','Anonymous','5','2015-03-23 22:23:35','C04911C0B3EE11E4B736F5F74BE2BA3D','30DA89F0D16811E4B181BDAC6DCE62D6'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 21:39:25','9C212A0085ED11E487DF61A235EE544C','3130A710CD7411E4B2FAEB0D340FE6A0'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 21:39:25','9C212A0085ED11E487DF61A235EE544C','3131B880CD7411E4B2FAEB0D340FE6A0'),('Test Title 4','127.0.0.1','Anonymous','4','2015-03-23 21:19:10','C04911C0B3EE11E4B736F5F74BE2BA3D','31753260D15F11E499F55B784C97896C'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 22:08:04','9C212A0085ED11E487DF61A235EE544C','32256A80CD7811E49188174F34676093'),('kjkjhkk','::1','Anonymous','11','2018-12-25 14:54:19','9C212A0085ED11E487DF61A235EE544C','33A76A3F36BD475F801892471DDD18F6'),('Test comment','10.0.1.1','VinceZK','2','2015-03-23 21:12:13','9C212A0085ED11E487DF61A235EE544C','38A8E000D15E11E4B62B856C8FA320A7'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 22:44:06','9C212A0085ED11E487DF61A235EE544C','3A612A90CD7D11E493B39FE7180A063B'),('test',NULL,'Anonymous','3',NULL,'9C212A0085ED11E487DF61A235EE544C','3AF8882801BE4C058997A8006D8171C3'),('test','::1','Anonymous','5','2019-02-24 17:31:25','9C212A0085ED11E487DF61A235EE544C','3AFA9FADABF1416DA9650C3CC4AE20CC'),('Test comment','10.0.1.1','VinceZK','2','2015-03-20 22:06:02','9C212A0085ED11E487DF61A235EE544C','3E27B610CF0A11E4A990C9E14B8DC73D'),('性能，使得OLAP能成为一个独立的概念？对于这个问题的答案也许每家企业在不同阶段都有不同的体会， 但Codd认为前者似乎才是最主要的原因，而那个时候他接受了Hyperion（BI厂商，已被ORACLE收购）的支助。Codd基于以下两个理由， 认为OLAP有','127.0.0.1','Anonymous','7','2015-03-23 22:09:39','C04911C0B3EE11E4B736F5F74BE2BA3D','3EDBA950D16611E4B181BDAC6DCE62D6'),('Blog 2 Test','127.0.0.1','Anonymous','1','2015-03-29 09:59:34','C04911C0B3EE11E4B736F5F74BE2BA3D','3F8379F0D5B711E4A182EB193BBD3E7D'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 22:15:37','9C212A0085ED11E487DF61A235EE544C','4007AFE1CD7911E48D858D310228F35A'),('ewrqe',NULL,'Anonymous','6',NULL,'9C212A0085ED11E487DF61A235EE544C','429FB6618D2F48748A20F30BB88F5CC5'),('Wix.com provides an easy-to-use online platform where you can create and publish your own website. Enjoy powerful drag & drop ed','127.0.0.1','Anonymous','8.1','2015-03-23 21:55:28','C04911C0B3EE11E4B736F5F74BE2BA3D','43377440D16411E4B181BDAC6DCE62D6'),('Test Comment 6','10.0.0.1','Anonymous','1','2018-12-23 20:00:00','6F484A70F16F11E4ADBB3D6DE2A014D5','43715626D3044162AB72E431590335EF'),('adfsdafds','::1',NULL,'4','2018-12-25 14:50:10','9C212A0085ED11E487DF61A235EE544C','4401DA0B1E594252B1B7D5D51474040E'),('Test comment','10.0.1.1','VinceZK','1','2015-03-20 23:25:07','9C212A0085ED11E487DF61A235EE544C','4A470A31CF1511E4BBE4CF64410BB8BA'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 21:40:07','9C212A0085ED11E487DF61A235EE544C','4A59FF70CD7411E4B2147757BC837EA6'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 21:40:07','9C212A0085ED11E487DF61A235EE544C','4A5AE9D0CD7411E4B2147757BC837EA6'),('Test Comment 5','10.0.0.1','Anonymous','1','2018-12-23 20:00:00','6F484A70F16F11E4ADBB3D6DE2A014D5','5398D5D58EF04F3295F92508E47EBA8D'),('争论到底是决策支持系统、商业智能、 商业分析（Business Analytics）抑或是大数据（Big Data），哪个更时髦，哪个更准确，哪个更有利可图是毫无意义的， 它们都是通过可诉性信息（Actionable Information）满足业务需','127.0.0.1','Anonymous','7','2015-03-23 22:10:15','C04911C0B3EE11E4B736F5F74BE2BA3D','542D93E0D16611E4B181BDAC6DCE62D6'),('Test Title 5','127.0.0.1','Anonymous','4','2015-03-23 21:20:12','C04911C0B3EE11E4B736F5F74BE2BA3D','55E84060D15F11E499F55B784C97896C'),('adfadf','::1','Anonymous','6','2018-12-25 14:51:37','9C212A0085ED11E487DF61A235EE544C','58831B0F3B764C2C91BDD072D4FCA7CD'),('test',NULL,'Anonymous','4',NULL,'9C212A0085ED11E487DF61A235EE544C','599280EBC1264EDC885778D88C5BEE67'),('Hello Test','127.0.0.1','Anonymous','8.1','2015-03-23 21:56:09','C04911C0B3EE11E4B736F5F74BE2BA3D','5BF70E50D16411E4B181BDAC6DCE62D6'),('test',NULL,'Anonymous','3',NULL,'9C212A0085ED11E487DF61A235EE544C','5D4590670E4F43BE94F727548780C4AA'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 22:16:29','9C212A0085ED11E487DF61A235EE544C','5EB20761CD7911E4A16303BF07B4A127'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 21:40:42','9C212A0085ED11E487DF61A235EE544C','5F0EBFA1CD7411E4866EAFAED945121A'),('Test','127.0.0.1','Anonymous','9','2015-03-23 21:27:37','C04911C0B3EE11E4B736F5F74BE2BA3D','5F7EAB40D16011E499F55B784C97896C'),('Wix.com provides an easy-to-use online platform where you can create and publish your own website. Enjoy powerful drag & drop','127.0.0.1','Anonymous','8.1','2015-03-23 21:56:16','C04911C0B3EE11E4B736F5F74BE2BA3D','602E7670D16411E4B181BDAC6DCE62D6'),('Test comment','10.0.1.1','VinceZK','1','2015-08-04 23:13:36','9C212A0085ED11E487DF61A235EE544C','613B26B13ABB11E59FAC77B696D1304F'),('Test comment','10.0.1.1','VinceZK','2','2015-03-23 21:13:21','9C212A0085ED11E487DF61A235EE544C','61672C40D15E11E4A4D497C5BA126531'),('hello','::1','Anonymous','6','2019-02-24 17:01:38','9C212A0085ED11E487DF61A235EE544C','616957D7F59F494389A8251D45F4BA94'),('Test comment','10.0.1.1','VinceZK','2','2015-03-20 22:07:06','9C212A0085ED11E487DF61A235EE544C','6420A0C0CF0A11E4A2FAB353707BEB91'),('Comment Test','10.0.1.1','VinceZK','3.1','2014-11-22 14:27:08','9C212A0085ED11E487DF61A235EE544C','67946B50CF7911E482CA674623ED2E5F'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 22:09:34','9C212A0085ED11E487DF61A235EE544C','67CD12A0CD7811E4805E49081EB621EC'),('test2',NULL,'Anonymous','3',NULL,'9C212A0085ED11E487DF61A235EE544C','696830AEDDB04AAF8853CDA6F4BF7AD9'),('Test comment','10.0.1.1','VinceZK','2','2015-03-23 21:13:36','9C212A0085ED11E487DF61A235EE544C','69DD4F80D15E11E4B5B3DD5C60BE0DF5'),(NULL,'127.0.0.1','Anonymous','6','2015-03-23 21:49:30','C04911C0B3EE11E4B736F5F74BE2BA3D','6E120640D16311E49801A3A4AE734C90'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 22:09:47','9C212A0085ED11E487DF61A235EE544C','6F4044D1CD7811E493A889C794979374'),('Test comment','10.0.1.1','VinceZK','2','2015-03-20 22:07:28','9C212A0085ED11E487DF61A235EE544C','717EDE80CF0A11E4B8D937927984CF5D'),('ewrqe',NULL,'Anonymous','6',NULL,'9C212A0085ED11E487DF61A235EE544C','71EEDBBFCE9949558CF2D28EC5483F23'),('ateaadf','127.0.0.1','Anonymous','7','2015-03-23 22:11:07','C04911C0B3EE11E4B736F5F74BE2BA3D','72DEA220D16611E4B181BDAC6DCE62D6'),('Test','127.0.0.1','Anonymous','10','2015-03-23 21:28:11','C04911C0B3EE11E4B736F5F74BE2BA3D','73E2DA70D16011E499F55B784C97896C'),('Test comment','10.0.1.1','VinceZK','1','2015-03-19 21:18:41','9C212A0085ED11E487DF61A235EE544C','76307631CE3A11E49498D14B51EF6258'),('Test comment','10.0.1.1','VinceZK','1','2015-03-19 21:25:54','9C212A0085ED11E487DF61A235EE544C','782FFA41CE3B11E4A4721101377D40E1'),('adfadsf','::1','Anonymous','4','2018-12-25 14:52:00','9C212A0085ED11E487DF61A235EE544C','7C1EA79C7B1B425DB516B943440752C1'),('Title Comment','::1','Anonymous','0','2018-12-25 12:15:17','6F484A70F16F11E4ADBB3D6DE2A014D5','7CB3E8D35DB5408AAD0791BF9A828DB9'),('争论到底是决策支持系统、商业智能、 商业分析（Business Analytics','127.0.0.1','Anonymous','7','2015-03-23 22:11:23','C04911C0B3EE11E4B736F5F74BE2BA3D','7CCFCCA0D16611E4B181BDAC6DCE62D6'),('test','::1','Vincent Zhang','5','2019-02-25 21:11:29','9C212A0085ED11E487DF61A235EE544C','8172D51E19C340A69880916713BBD493'),('OL Test','127.0.0.1','Anonymous','8.0','2015-03-23 21:21:30','C04911C0B3EE11E4B736F5F74BE2BA3D','84890CB0D15F11E499F55B784C97896C'),('First Comment Test','127.0.0.1','Anonymous','1','2015-03-22 11:42:52','C04911C0B3EE11E4B736F5F74BE2BA3D','84E2E2A0D04511E4AB3C5B24B0CD5666'),('test comment','::1',NULL,'6','2018-12-25 14:44:36','9C212A0085ED11E487DF61A235EE544C','8595FDC4840F48DDAF2E5BC64325AF85'),(NULL,'127.0.0.1','Anonymous','6','2015-03-23 21:50:12','C04911C0B3EE11E4B736F5F74BE2BA3D','86FDB960D16311E48A7FB95DA59E6670'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 21:20:28','9C212A0085ED11E487DF61A235EE544C','8B8B53C0CD7111E4B44A1724542E32D6'),('ewrqe',NULL,'Anonymous','6',NULL,'9C212A0085ED11E487DF61A235EE544C','8BD88CBF008642248767B1954C36D5A9'),('OL Test 2','127.0.0.1','Anonymous','8.0','2015-03-23 21:21:53','C04911C0B3EE11E4B736F5F74BE2BA3D','921ED530D15F11E499F55B784C97896C'),('Test comment','10.0.1.1','VinceZK','1','2015-03-19 21:19:34','9C212A0085ED11E487DF61A235EE544C','95D72F11CE3A11E4BCB13B9DF7AD03F1'),('First Comment Test','127.0.0.1','Anonymous','1','2015-03-22 11:36:12','C04911C0B3EE11E4B736F5F74BE2BA3D','966766F0D04411E48119E580EDBEC24F'),('Test comment','10.0.1.1','VinceZK','1','2015-03-19 21:26:48','9C212A0085ED11E487DF61A235EE544C','98D3D7D1CE3B11E4A786555EC35E36B4'),('Test Comment 1','10.0.0.1','DH001','1','2018-03-18 22:42:35','6F484A70F16F11E4ADBB3D6DE2A014D5','98FE3A8B9C8F41CF8A7FB8A5F4F85956'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 22:39:36','9C212A0085ED11E487DF61A235EE544C','99CEE770CD7C11E4AAB5E165BD0BAE95'),('test1','::1','Anonymous','5','2019-02-24 18:38:16','9C212A0085ED11E487DF61A235EE544C','9A248B7EFED84C4AA3C35E34E88B89EE'),('到底是因为综合分析业务日志太有用了，还是因为它妨碍了记录业务日志的性能，使得OLAP能成为一个独立的概念？对于这个问题的答案也许每家企业在不同阶段都有不同的体会','127.0.0.1','Anonymous','5','2015-03-23 22:26:52','C04911C0B3EE11E4B736F5F74BE2BA3D','A6471DC0D16811E4B181BDAC6DCE62D6'),(NULL,'127.0.0.1','Anonymous','5','2015-03-23 21:43:56','C04911C0B3EE11E4B736F5F74BE2BA3D','A6B5CCD0D16211E4A1A15749592BDF30'),('Test Comment 8','10.0.0.1','Anonymous','1','2018-12-23 20:00:00','6F484A70F16F11E4ADBB3D6DE2A014D5','A77FB91F23C54A2DAA448623C298D907'),('Test comment','10.0.1.1','VinceZK','1','2015-03-20 23:20:41','9C212A0085ED11E487DF61A235EE544C','ABB92291CF1411E4AC8EAFEEFBDD90E7'),('Test Title 2','127.0.0.1','Anonymous','4','2015-03-23 21:15:29','C04911C0B3EE11E4B736F5F74BE2BA3D','AD35E940D15E11E4B3239F7B7DCC11F2'),('Test reference','127.0.0.1','Anonymous','16','2015-03-23 21:29:49','C04911C0B3EE11E4B736F5F74BE2BA3D','AE000520D16011E499F55B784C97896C'),('test',NULL,'Anonymous','4',NULL,'9C212A0085ED11E487DF61A235EE544C','AE4F1B0FBDFF41DDB4C315CCE5701B20'),('dfasdfasd','::1','Anonymous','7','2018-12-25 14:57:34','9C212A0085ED11E487DF61A235EE544C','AED971F3238645D9ACCBE00D85CC6D34'),('Comment Test','10.0.1.1','VinceZK','3.1','2014-11-22 14:27:08','9C212A0085ED11E487DF61A235EE544C','AF099230CF7911E482CA674623ED2E5F'),('test',NULL,'Anonymous','6',NULL,'9C212A0085ED11E487DF61A235EE544C','AF3E4791386C44C6AA1EC4DF1CF26516'),('就这点上，黑屋更认同“决策支持系统”','127.0.0.1','Anonymous','10','2015-03-29 09:12:39','C04911C0B3EE11E4B736F5F74BE2BA3D','B1461CC0D5B011E494CA61E91F024143'),('Test Comment 2','10.0.0.1','DH001','1','2018-03-18 22:42:50','6F484A70F16F11E4ADBB3D6DE2A014D5','B2B8DBCB57F142C3A14DC32C92781B55'),('Test Comment 4','10.0.0.1','Anonymous','1','2018-12-23 20:00:00','6F484A70F16F11E4ADBB3D6DE2A014D5','B6E28069E8AE4B1A9D30422828441CA5'),('dfasdfdsaf','::1','Anonymous','12','2018-12-25 15:00:55','9C212A0085ED11E487DF61A235EE544C','B76E0B358690401EAB77D2ABEA7FE059'),('ewrqe',NULL,'Anonymous','6',NULL,'9C212A0085ED11E487DF61A235EE544C','B7BD19522F064DD290274B9AAE6B68D6'),('test','::1','Anonymous','5','2019-02-24 17:44:54','9C212A0085ED11E487DF61A235EE544C','B7D2E0BDF2274D3887B295039931230B'),('Test Comment 3','10.0.0.1','Anonymous','1','2018-12-23 20:00:00','6F484A70F16F11E4ADBB3D6DE2A014D5','B92AD16C853841999B0E5B7AE812A9AE'),('ewrqe',NULL,'Anonymous','6',NULL,'9C212A0085ED11E487DF61A235EE544C','BB8C7F4154B643178FF556EDDD4122A1'),(NULL,'127.0.0.1','Anonymous','5','2015-03-23 21:44:36','C04911C0B3EE11E4B736F5F74BE2BA3D','BEC306D0D16211E4A1A15749592BDF30'),('本文用了将近一半的篇幅作了论述，这也仅仅是笔者写作过程中突然的有感而发。即便是钟情代码和模型，也得有能力认清真实价值。 架构一个系统的目的毕竟还是为了解决一个实际问题。这个系列还是以讲数据模型为主，然而也不可能一一列举40年来每种可诉性信息系统概念背后的数','127.0.0.1','Anonymous','7','2015-03-23 22:13:20','C04911C0B3EE11E4B736F5F74BE2BA3D','C2285510D16611E4B181BDAC6DCE62D6'),('到底是因为综合分析业务日志太有用了，还是因为它妨碍了记录业务日志的性能，使得OLAP能成为一个独立的概念？对于这个问题的答案也许每家企业在不同阶段都有不同的体会， 但Codd认为前者似乎才是最主要的原因，而那个时候他接受了Hyperion（BI厂商，已被O','127.0.0.1','Anonymous','5','2015-03-24 19:41:54','C04911C0B3EE11E4B736F5F74BE2BA3D','C4EA4E70D21A11E4B181BDAC6DCE62D6'),('Test comment','10.0.1.1','VinceZK','1','2017-02-03 12:18:19','9C212A0085ED11E487DF61A235EE544C','CC569990E9C711E6853B917BEA847AFB'),('Title Comment','::1','Anonymous','0','2018-12-25 12:17:27','6F484A70F16F11E4ADBB3D6DE2A014D5','D0C6242BCDA24D5190C546C08B59FDD0'),('Test comment','10.0.1.1','VinceZK','1','2017-02-03 13:01:26','9C212A0085ED11E487DF61A235EE544C','D212E540E9CD11E686E88177B070BA5B'),('Test Title 3','127.0.0.1','Anonymous','4','2015-03-23 21:16:37','C04911C0B3EE11E4B736F5F74BE2BA3D','D5D14430D15E11E499F55B784C97896C'),('Hello laskjdflk asdfaskldjfklasdjflkasdjflkasjdflkajsdkfjasdlkfjaklsdjfklasdjfklasjdlfkjasdlkfjasldkfjlaskdjflaksdjfklajsdlfkjas','127.0.0.1','Anonymous','8.1','2015-03-23 21:52:37','C04911C0B3EE11E4B736F5F74BE2BA3D','DD7B99B0D16311E4B181BDAC6DCE62D6'),('Test comment','10.0.1.1','VinceZK','1','2015-03-19 21:14:25','9C212A0085ED11E487DF61A235EE544C','DDD9E561CE3911E48ED8AB04245CA3F9'),('Test comment','10.0.1.1','VinceZK','1','2015-08-15 23:47:01','9C212A0085ED11E487DF61A235EE544C','DF19F8C1436411E58A735FF1D7B60553'),('test',NULL,'Anonymous','3',NULL,'9C212A0085ED11E487DF61A235EE544C','E1B07E20EAB84EE086C5C0288749571A'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 21:30:04','9C212A0085ED11E487DF61A235EE544C','E31B71F0CD7211E4A29B37A1A83C0FA8'),('Title Comment','10.0.0.1','Anonymous','0','2018-12-23 20:00:00','6F484A70F16F11E4ADBB3D6DE2A014D5','E3F00921DABB4ECFABA248FF0ACED04A'),(NULL,'::1','Anonymous','5','2019-02-24 17:31:21','9C212A0085ED11E487DF61A235EE544C','E466286FE3654A5EBB17E210CE0BD740'),('Title Comment','10.0.0.1',NULL,'0','2018-12-23 20:00:00','6F484A70F16F11E4ADBB3D6DE2A014D5','E4AB290E607F4AD7B2DFB546547DABE0'),('Test Graph','127.0.0.1','Anonymous','18','2015-03-23 21:31:22','C04911C0B3EE11E4B736F5F74BE2BA3D','E5AC7DF0D16011E499F55B784C97896C'),('Test Comment 10','10.0.0.1','Anonymous','1','2018-12-23 20:00:00','6F484A70F16F11E4ADBB3D6DE2A014D5','E680D36492BF47258378912460AC2852'),('Hello Comment','127.0.0.1','Anonymous','9','2015-03-29 09:21:20','C04911C0B3EE11E4B736F5F74BE2BA3D','E7C7DBC0D5B111E494CA61E91F024143'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 22:41:49','9C212A0085ED11E487DF61A235EE544C','E8FF6D10CD7C11E4AE0A2D9BDEE68693'),('Test Comment 7','10.0.0.1','Anonymous','1','2018-12-23 20:00:00','6F484A70F16F11E4ADBB3D6DE2A014D5','E93EBDC532A249ACBD7EF9C9B95F0F4A'),('Test Graph 2','127.0.0.1','Anonymous','18','2015-03-23 21:31:29','C04911C0B3EE11E4B736F5F74BE2BA3D','E96F7960D16011E499F55B784C97896C'),('Test comment','10.0.1.1','VinceZK','1','2015-03-20 23:22:27','9C212A0085ED11E487DF61A235EE544C','EB454B01CF1411E4B2940144A215E381'),('更加商业化的命名给概括， 这便是“商业智能”（Business Intelligence）。以之对应，更偏向学术上对此类计算机系统的定义则是OLAP（On-Line-Analytic-Processing）','127.0.0.1','Anonymous','6','2015-03-23 22:28:52','C04911C0B3EE11E4B736F5F74BE2BA3D','EDDB1740D16811E4B181BDAC6DCE62D6'),('Test Graph 3','127.0.0.1','Anonymous','18','2015-03-23 21:31:43','C04911C0B3EE11E4B736F5F74BE2BA3D','F1C34790D16011E499F55B784C97896C'),('Test','127.0.0.1','Anonymous','11','2015-03-24 21:52:00','C04911C0B3EE11E4B736F5F74BE2BA3D','F20BA180D22C11E4B181BDAC6DCE62D6'),('Test comment','10.0.1.1','VinceZK','1','2015-03-18 21:30:29','9C212A0085ED11E487DF61A235EE544C','F21696D0CD7211E4B498ED84D2A4EBC6'),('sdsfsd','::1',NULL,'3','2018-12-25 14:45:35','9C212A0085ED11E487DF61A235EE544C','F873D0F8AC0B437DA38A6ACCFD83552E'),('ewrqe','::1','Anonymous','6','2019-02-24 16:58:41','9C212A0085ED11E487DF61A235EE544C','FB61FD009AC34CAB9DC25AABC7111AB5'),('Test Comment 11','10.0.0.1','Anonymous','1','2018-12-23 20:00:00','6F484A70F16F11E4ADBB3D6DE2A014D5','FC9F84BD4A05475CA106819C8418B617');
/*!40000 ALTER TABLE `r_comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `r_company`
--

DROP TABLE IF EXISTS `r_company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `r_company` (
  `INSTANCE_GUID` varchar(32) DEFAULT NULL,
  `COMPANY_DESC` varchar(200) DEFAULT NULL COMMENT '46075A50FB07A981E65E9FAE4BEC1358',
  `COMPANY_ID` varchar(20) NOT NULL COMMENT '8B7E439841BC1C43238B68C5B05C5051',
  PRIMARY KEY (`COMPANY_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `r_company`
--

LOCK TABLES `r_company` WRITE;
/*!40000 ALTER TABLE `r_company` DISABLE KEYS */;
INSERT INTO `r_company` VALUES ('F0423B2A5C934C858F7D0437DFA27157','Darkhouse','DARKHOUSE');
/*!40000 ALTER TABLE `r_company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `r_email`
--

DROP TABLE IF EXISTS `r_email`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `r_email` (
  `EMAIL` varchar(200) NOT NULL COMMENT '8549B2388F8C3E6381CA15043EC4CFAE',
  `TYPE` varchar(10) DEFAULT NULL COMMENT '874DE1A0CF38C6C4B740E2B68F1E43F6',
  `PRIMARY` tinyint(1) DEFAULT NULL COMMENT '4F67CEB6E97059D2E59614734EA80D12',
  `INSTANCE_GUID` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`EMAIL`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `r_email`
--

LOCK TABLES `r_email` WRITE;
/*!40000 ALTER TABLE `r_email` DISABLE KEYS */;
INSERT INTO `r_email` VALUES ('anonymous@darkhouse.com.cn','WORK',1,'B99348C0336D11E9820805351193F8B8'),('DH001@hotmail.com','WORK',1,'2FBE7490E10F11E8A90957FA46F2CECA'),('dh002@darkhouse.com','WORK',1,'430C8BB0E1C611E8877F9D5C9668A7A3');
/*!40000 ALTER TABLE `r_email` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `r_employee`
--

DROP TABLE IF EXISTS `r_employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `r_employee` (
  `USER_ID` varchar(10) NOT NULL COMMENT 'D64809E480B5958454AF5CD8C40B014F',
  `COMPANY_ID` varchar(20) DEFAULT NULL COMMENT '5EC22219F4E45746BFCDE76256FD6160',
  `DEPARTMENT_ID` varchar(20) DEFAULT NULL COMMENT '849D0D50634137D6E9F9D6F153C67627',
  `TITLE` varchar(64) DEFAULT NULL COMMENT 'E5016EE79DC1B36DAAA9027173674BB4',
  `GENDER` varchar(10) DEFAULT NULL COMMENT 'E6FF69F311DCE5E6328029FB932F20E3',
  `INSTANCE_GUID` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`USER_ID`),
  KEY `REC_GUID` (`INSTANCE_GUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `r_employee`
--

LOCK TABLES `r_employee` WRITE;
/*!40000 ALTER TABLE `r_employee` DISABLE KEYS */;
INSERT INTO `r_employee` VALUES ('anonymous','DARKHOUSE',NULL,NULL,'Unknown','B99348C0336D11E9820805351193F8B8'),('DH001','DARKHOUSE','DEVELOPMENT','Developer','Male','2FBE7490E10F11E8A90957FA46F2CECA'),('DH002','DARKHOUSE','DEVELOPMENT','Developer','Female','430C8BB0E1C611E8877F9D5C9668A7A3');
/*!40000 ALTER TABLE `r_employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `r_goods`
--

DROP TABLE IF EXISTS `r_goods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `r_goods` (
  `MATERIAL_ID` varchar(40) NOT NULL COMMENT '6E87AF00F32B11E9AB756F2008E0531B',
  `PRICE` decimal(23,2) DEFAULT NULL COMMENT '6E87AF01F32B11E9AB756F2008E0531B',
  `UNIT` varchar(10) DEFAULT NULL COMMENT '6E87AF02F32B11E9AB756F2008E0531B',
  `INSTANCE_GUID` varchar(32) DEFAULT NULL,
  `CURRENCY_CODE` varchar(3) DEFAULT NULL COMMENT '5AF806B0F35311E98F6A9F800EA12272',
  `MATERIAL_DESC` varchar(200) DEFAULT NULL COMMENT '209D3580F3FD11E98F6A9F800EA12272',
  PRIMARY KEY (`MATERIAL_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `r_goods`
--

LOCK TABLES `r_goods` WRITE;
/*!40000 ALTER TABLE `r_goods` DISABLE KEYS */;
INSERT INTO `r_goods` VALUES ('M0001',18.00,'KG','B9DA9A90F35211E98F6A9F800EA12272','CNY','Fruit Candy'),('M0002',30.00,'KG','950BE290F35311E98F6A9F800EA12272','CNY','Chocolate');
/*!40000 ALTER TABLE `r_goods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `r_order_head`
--

DROP TABLE IF EXISTS `r_order_head`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `r_order_head` (
  `ORDER_NO` int(11) unsigned NOT NULL COMMENT '920E3720F34C11E9AF9DED626772E89F',
  `SOLD_TO_PARTY` varchar(30) DEFAULT NULL COMMENT '920E5E30F34C11E9AF9DED626772E89F',
  `SHIP_TO_PARTY` varchar(30) DEFAULT NULL COMMENT '920E5E31F34C11E9AF9DED626772E89F',
  `BILL_TO_PARTY` varchar(30) DEFAULT NULL COMMENT '920E5E32F34C11E9AF9DED626772E89F',
  `PAY_TO_PARTY` varchar(30) DEFAULT NULL COMMENT '920E5E33F34C11E9AF9DED626772E89F',
  `REMARK` varchar(200) DEFAULT NULL COMMENT '920E5E34F34C11E9AF9DED626772E89F',
  `INSTANCE_GUID` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`ORDER_NO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `r_order_head`
--

LOCK TABLES `r_order_head` WRITE;
/*!40000 ALTER TABLE `r_order_head` DISABLE KEYS */;
INSERT INTO `r_order_head` VALUES (10000,'C00001','C00001','C00001','C00001','Bring to me immediately','5CBF79C0F4D311E997501D1A99C0C387'),(100001,'C00001','C00001','C00001','C00001','Bring to me immediately','94FA7D50F4DB11E99A39795F1E41AB73'),(100003,'C00001','C00001','C00001','C00001','Bring to me immediately','D2B7C740F4DD11E9A8BD29964292B968');
/*!40000 ALTER TABLE `r_order_head` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `r_order_item`
--

DROP TABLE IF EXISTS `r_order_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `r_order_item` (
  `ORDER_NO` int(11) unsigned NOT NULL COMMENT 'B363CF90F2EB11E9AB756F2008E0531B',
  `ITEM_NO` int(11) unsigned NOT NULL COMMENT 'B363CF91F2EB11E9AB756F2008E0531B',
  `MATERIAL_ID` varchar(40) DEFAULT NULL COMMENT 'B363CF92F2EB11E9AB756F2008E0531B',
  `QUANTITY` decimal(23,4) DEFAULT NULL COMMENT 'B363CF93F2EB11E9AB756F2008E0531B',
  `UNIT` varchar(10) DEFAULT NULL COMMENT 'B363CF94F2EB11E9AB756F2008E0531B',
  `PRICE` decimal(23,2) DEFAULT NULL COMMENT 'B363CF95F2EB11E9AB756F2008E0531B',
  `REMARK` varchar(200) DEFAULT NULL COMMENT 'B363CF96F2EB11E9AB756F2008E0531B',
  `INSTANCE_GUID` varchar(32) DEFAULT NULL,
  `CURRENCY_CODE` varchar(3) DEFAULT NULL COMMENT '6BA19EE0F35311E98F6A9F800EA12272',
  PRIMARY KEY (`ORDER_NO`,`ITEM_NO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `r_order_item`
--

LOCK TABLES `r_order_item` WRITE;
/*!40000 ALTER TABLE `r_order_item` DISABLE KEYS */;
INSERT INTO `r_order_item` VALUES (10000,10,'M0001',1.0000,'KG',18.00,'Orange','5CBF79C0F4D311E997501D1A99C0C387','CNY'),(10000,20,'M0002',1.0000,'KG',30.00,'Black','5CBF79C0F4D311E997501D1A99C0C387','CNY'),(100001,10,'M0001',2.0000,'KG',36.00,'Orange','94FA7D50F4DB11E99A39795F1E41AB73','CNY'),(100001,20,'M0002',3.0000,'KG',90.00,'Black','94FA7D50F4DB11E99A39795F1E41AB73','CNY'),(100003,10,'M0001',2.0000,'KG',36.00,'Orange','D2B7C740F4DD11E9A8BD29964292B968','CNY'),(100003,20,'M0002',3.0000,'KG',90.00,'Black','D2B7C740F4DD11E9A8BD29964292B968','CNY');
/*!40000 ALTER TABLE `r_order_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `r_personalization`
--

DROP TABLE IF EXISTS `r_personalization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `r_personalization` (
  `USER_ID` varchar(10) NOT NULL COMMENT 'ED15E1F3DB7F1B011871CEAC628CF06C',
  `DATE_FORMAT` int(11) DEFAULT NULL COMMENT '37C7C8C24EBDB3A725FC7D6CF719A06E',
  `DECIMAL_FORMAT` int(11) DEFAULT NULL COMMENT '9718C0E8783C1F86EC212C8436A958C5',
  `TIMEZONE` varchar(10) DEFAULT NULL COMMENT '6EA9A83FA267F82EBE1B381D56A3F312',
  `LANGUAGE` varchar(6) DEFAULT NULL COMMENT 'D8CDF1E5208AF30FE47D272DA304DE71',
  `INSTANCE_GUID` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`USER_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `r_personalization`
--

LOCK TABLES `r_personalization` WRITE;
/*!40000 ALTER TABLE `r_personalization` DISABLE KEYS */;
INSERT INTO `r_personalization` VALUES ('DH001',2,1,'UTC+8','ZH','2FBE7490E10F11E8A90957FA46F2CECA'),('DH002',1,1,'UTC+8','ZH','430C8BB0E1C611E8877F9D5C9668A7A3');
/*!40000 ALTER TABLE `r_personalization` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `r_retail_customer`
--

DROP TABLE IF EXISTS `r_retail_customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `r_retail_customer` (
  `CUSTOMER_NO` varchar(30) NOT NULL COMMENT '6D3AD1C0F32D11E9AB756F2008E0531B',
  `EMAIL` varchar(200) DEFAULT NULL COMMENT '6D3AD1C2F32D11E9AB756F2008E0531B',
  `CELL_PHONE` varchar(15) DEFAULT NULL COMMENT '6D3AD1C3F32D11E9AB756F2008E0531B',
  `INSTANCE_GUID` varchar(32) DEFAULT NULL,
  `GENDER` varchar(10) DEFAULT NULL COMMENT 'B9E09860F32E11E9AB756F2008E0531B',
  `DISPLAY_NAME` varchar(128) DEFAULT NULL COMMENT 'B9E09861F32E11E9AB756F2008E0531B',
  `BIRTHDAY` date DEFAULT NULL COMMENT 'B9E09862F32E11E9AB756F2008E0531B',
  `CREDIT` int(11) unsigned DEFAULT NULL COMMENT 'B9E09863F32E11E9AB756F2008E0531B',
  PRIMARY KEY (`CUSTOMER_NO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `r_retail_customer`
--

LOCK TABLES `r_retail_customer` WRITE;
/*!40000 ALTER TABLE `r_retail_customer` DISABLE KEYS */;
INSERT INTO `r_retail_customer` VALUES ('C00001','sweetlover@darkhouse.com.cn','+13241234123','EBA0F460F35311E98F6A9F800EA12272','Female','Sweet Lover','2019-10-07',70),('C00002','chocolover@darkhouse.com.cn','+13241234156','21B3F670F4DE11E99E406180136CE0E4','Male','Sweet Lover','2019-10-07',70);
/*!40000 ALTER TABLE `r_retail_customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `r_role`
--

DROP TABLE IF EXISTS `r_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `r_role` (
  `DESCRIPTION` varchar(200) DEFAULT NULL COMMENT '378658E8863842AE9CA1DCB448EF6B36',
  `NAME` varchar(64) NOT NULL COMMENT '0812F1F6AC5C42078E1F66DD9F6F207E',
  `INSTANCE_GUID` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`NAME`),
  KEY `REC_GUID` (`INSTANCE_GUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `r_role`
--

LOCK TABLES `r_role` WRITE;
/*!40000 ALTER TABLE `r_role` DISABLE KEYS */;
INSERT INTO `r_role` VALUES ('Administrator','administrator','391E75B02A1811E981F3C33C6FB0A7C1'),('Everyone','everyone','AF7E5550E7E511E992DC7BC6FE1F471B'),('Test features ','tester','23F3AE905E8311E9A91C03500E3C8091');
/*!40000 ALTER TABLE `r_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `r_user`
--

DROP TABLE IF EXISTS `r_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `r_user` (
  `USER_ID` varchar(10) NOT NULL COMMENT 'D84D9A544984A20BCF0BAD59977277E8',
  `USER_NAME` varchar(64) DEFAULT NULL COMMENT '793A63D8DEA43B5BF88EE7BAF02757C4',
  `PASSWORD` varchar(64) DEFAULT NULL COMMENT '82FE8C179A3D832C12AD332044558575',
  `PWD_STATE` int(11) DEFAULT NULL COMMENT '50B8AD3E3460A8AD3A881490CAE1935D',
  `LOCK` tinyint(4) DEFAULT NULL COMMENT '9AB0CF119EF2D8CEBBBFA0320CACADD6',
  `DISPLAY_NAME` varchar(128) DEFAULT NULL COMMENT 'DB3D668D338E076626061456992F60DB',
  `FAMILY_NAME` varchar(64) DEFAULT NULL COMMENT 'E0392472ABB6DB7FDB5FFC92B5DC7A29',
  `GIVEN_NAME` varchar(64) DEFAULT NULL COMMENT '02C2EE9D3CA229EAD8919007CC3858C',
  `MIDDLE_NAME` varchar(64) DEFAULT NULL COMMENT '90D418F172B221C71D62598C119E97D5',
  `INSTANCE_GUID` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`USER_ID`),
  KEY `REC_GUID` (`INSTANCE_GUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `r_user`
--

LOCK TABLES `r_user` WRITE;
/*!40000 ALTER TABLE `r_user` DISABLE KEYS */;
INSERT INTO `r_user` VALUES ('anonymous','Anonymous','pass',1,NULL,'Anonymous',NULL,'Anonymous','xxxx','B99348C0336D11E9820805351193F8B8'),('DH001','VINCEZK','Dark1234',1,NULL,'Vincent Zhang','Zhang','Vincent','zklee','2FBE7490E10F11E8A90957FA46F2CECA'),('DH002','Eleven',NULL,1,0,'Seven Eleven','Seven','Eleven',NULL,'430C8BB0E1C611E8877F9D5C9668A7A3');
/*!40000 ALTER TABLE `r_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rs_app_category`
--

DROP TABLE IF EXISTS `rs_app_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rs_app_category` (
  `INSTANCE_GUID` varchar(32) NOT NULL,
  `app_category_INSTANCE_GUID` varchar(32) DEFAULT NULL COMMENT '8ACE80005DBA11E9929E67A69E53053F',
  `app_category_ENTITY_ID` varchar(32) DEFAULT NULL COMMENT '8ACE80015DBA11E9929E67A69E53053F',
  `portal_app_INSTANCE_GUID` varchar(32) DEFAULT NULL COMMENT '8ACE80025DBA11E9929E67A69E53053F',
  `portal_app_ENTITY_ID` varchar(32) DEFAULT NULL COMMENT '8ACE80035DBA11E9929E67A69E53053F',
  `ORDER` int(11) unsigned DEFAULT NULL COMMENT '37FD84D06F0211E9B5DAAF32900A09BA',
  PRIMARY KEY (`INSTANCE_GUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rs_app_category`
--

LOCK TABLES `rs_app_category` WRITE;
/*!40000 ALTER TABLE `rs_app_category` DISABLE KEYS */;
INSERT INTO `rs_app_category` VALUES ('6A56A3D02A1A11E981F3C33C6FB0A7C1','3D9D0AE02A1611E9BBE39B9C6748A022','category','ABAB7C202A0B11E98FB33576955DB73A','app',NULL),('6A56A3D12A1A11E981F3C33C6FB0A7C1','3D9D0AE02A1611E9BBE39B9C6748A022','category','B91A0D902A0B11E98FB33576955DB73A','app',NULL),('6A56A3D22A1A11E981F3C33C6FB0A7C1','3D9D0AE02A1611E9BBE39B9C6748A022','category','830A7AE02A1611E9BBE39B9C6748A022','app',NULL),('7D8BC8E02A1A11E981F3C33C6FB0A7C1','87676B0029D711E9AC5E594C14A66283','category','F729EAB02A1511E9BBE39B9C6748A022','app',NULL),('8D1D61602A1A11E981F3C33C6FB0A7C1','B16516702A1611E9BBE39B9C6748A022','category','C349EEC02A0B11E98FB33576955DB73A','app',NULL),('A4425E402A1A11E981F3C33C6FB0A7C1','E273E94029D911E9AC5E594C14A66283','category','568822C02A0B11E98FB33576955DB73A','app',NULL),('A4425E412A1A11E981F3C33C6FB0A7C1','E273E94029D911E9AC5E594C14A66283','category','680ED4802A0B11E98FB33576955DB73A','app',NULL),('E632A9706EFA11E98808DFA641575D74','3B37C1F029DA11E9AC5E594C14A66283','category','364DAB906EFA11E98808DFA641575D74','app',0);
/*!40000 ALTER TABLE `rs_app_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rs_marriage`
--

DROP TABLE IF EXISTS `rs_marriage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rs_marriage` (
  `INSTANCE_GUID` varchar(32) NOT NULL,
  `REG_PLACE` varchar(256) DEFAULT NULL COMMENT '68BEC95005C911E9A1D55FBB5A2440AC',
  `COUNTRY` varchar(10) DEFAULT NULL COMMENT '68BEF06005C911E9A1D55FBB5A2440AC',
  `husband_INSTANCE_GUID` varchar(32) DEFAULT NULL COMMENT '167916A05DBC11E9929E67A69E53053F',
  `husband_ENTITY_ID` varchar(32) DEFAULT NULL COMMENT '167916A15DBC11E9929E67A69E53053F',
  `wife_INSTANCE_GUID` varchar(32) DEFAULT NULL COMMENT '167916A25DBC11E9929E67A69E53053F',
  `wife_ENTITY_ID` varchar(32) DEFAULT NULL COMMENT '167916A35DBC11E9929E67A69E53053F',
  `VALID_FROM` datetime DEFAULT NULL COMMENT '0A80CD505DC311E9BC3DE104595EF532',
  `VALID_TO` datetime DEFAULT NULL COMMENT '0A80CD515DC311E9BC3DE104595EF532',
  PRIMARY KEY (`INSTANCE_GUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rs_marriage`
--

LOCK TABLES `rs_marriage` WRITE;
/*!40000 ALTER TABLE `rs_marriage` DISABLE KEYS */;
INSERT INTO `rs_marriage` VALUES ('26E70A302A1B11E981F3C33C6FB0A7C1','Jiangsu XXXX','China','2FBE7490E10F11E8A90957FA46F2CECA','person','430C8BB0E1C611E8877F9D5C9668A7A3','person','2019-02-06 22:26:11','2029-02-03 22:25:45');
/*!40000 ALTER TABLE `rs_marriage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rs_system_role_category`
--

DROP TABLE IF EXISTS `rs_system_role_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rs_system_role_category` (
  `INSTANCE_GUID` varchar(32) NOT NULL,
  `app_category_INSTANCE_GUID` varchar(32) DEFAULT NULL COMMENT 'E38ECBB05DB911E9929E67A69E53053F',
  `app_category_ENTITY_ID` varchar(32) DEFAULT NULL COMMENT 'E38ECBB15DB911E9929E67A69E53053F',
  `system_role_INSTANCE_GUID` varchar(32) DEFAULT NULL COMMENT 'E38ECBB25DB911E9929E67A69E53053F',
  `system_role_ENTITY_ID` varchar(32) DEFAULT NULL COMMENT 'E38ECBB35DB911E9929E67A69E53053F',
  `ORDER` int(11) unsigned DEFAULT NULL COMMENT '2906CCC06F0211E9B5DAAF32900A09BA',
  PRIMARY KEY (`INSTANCE_GUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rs_system_role_category`
--

LOCK TABLES `rs_system_role_category` WRITE;
/*!40000 ALTER TABLE `rs_system_role_category` DISABLE KEYS */;
INSERT INTO `rs_system_role_category` VALUES ('A8E80F805E8611E9A91C03500E3C8091','3B37C1F029DA11E9AC5E594C14A66283','category','23F3AE905E8311E9A91C03500E3C8091','permission',10),('BD3255B06EFB11E9B5DAAF32900A09BA','3B37C1F029DA11E9AC5E594C14A66283','category','391E75B02A1811E981F3C33C6FB0A7C1','permission',20),('E93324302A1A11E981F3C33C6FB0A7C1','87676B0029D711E9AC5E594C14A66283','category','391E75B02A1811E981F3C33C6FB0A7C1','permission',0),('E93324312A1A11E981F3C33C6FB0A7C1','E273E94029D911E9AC5E594C14A66283','category','391E75B02A1811E981F3C33C6FB0A7C1','permission',10),('E9334B402A1A11E981F3C33C6FB0A7C1','B16516702A1611E9BBE39B9C6748A022','category','391E75B02A1811E981F3C33C6FB0A7C1','permission',30),('E9334B412A1A11E981F3C33C6FB0A7C1','3D9D0AE02A1611E9BBE39B9C6748A022','category','391E75B02A1811E981F3C33C6FB0A7C1','permission',40);
/*!40000 ALTER TABLE `rs_system_role_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rs_user_role`
--

DROP TABLE IF EXISTS `rs_user_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rs_user_role` (
  `INSTANCE_GUID` varchar(32) NOT NULL,
  `SYNCED` tinyint(1) DEFAULT NULL COMMENT 'A637AD08C5E8A89445982B15C7D83459',
  `system_role_INSTANCE_GUID` varchar(32) DEFAULT NULL COMMENT 'F91D45E15DC011E9BC3DE104595EF532',
  `system_role_ENTITY_ID` varchar(32) DEFAULT NULL COMMENT 'F91D45E25DC011E9BC3DE104595EF532',
  `system_user_INSTANCE_GUID` varchar(32) DEFAULT NULL COMMENT 'F91D45E35DC011E9BC3DE104595EF532',
  `system_user_ENTITY_ID` varchar(32) DEFAULT NULL COMMENT 'F91D45E45DC011E9BC3DE104595EF532',
  PRIMARY KEY (`INSTANCE_GUID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rs_user_role`
--

LOCK TABLES `rs_user_role` WRITE;
/*!40000 ALTER TABLE `rs_user_role` DISABLE KEYS */;
INSERT INTO `rs_user_role` VALUES ('06FEB4702A1B11E981F3C33C6FB0A7C1',1,'391E75B02A1811E981F3C33C6FB0A7C1','permission','2FBE7490E10F11E8A90957FA46F2CECA','person'),('74A448A0642211E9B7AAE3102CF08A60',1,'23F3AE905E8311E9A91C03500E3C8091','permission','430C8BB0E1C611E8877F9D5C9668A7A3','person'),('DBDB6CB0F59A11E99A3DAF2E6B617B70',1,'23F3AE905E8311E9A91C03500E3C8091','permission','B99348C0336D11E9820805351193F8B8','person');
/*!40000 ALTER TABLE `rs_user_role` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-10-23 21:45:03
