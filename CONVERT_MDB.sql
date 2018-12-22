show fields from `person`;

SELECT column_name as 'ATTR_NAME', ordinal_position as 'ORDER', DATA_TYPE, 
       CHARACTER_MAXIMUM_LENGTH as 'DATA_LENGTH', 
       numeric_precision, numeric_scale, column_key, extra, is_nullable
  FROM information_schema.columns 
  WHERE (table_schema='MDB' and table_name = 'r_comment')
  order by ordinal_position;
  
SELECT *
  FROM information_schema.columns 
  WHERE (table_schema='MDB' and table_name = 'r_address')
  order by ordinal_position;
  
delete from entity where ENTITY_ID = 'testEntity';
delete from relation where RELATION_ID = 'testEntity';
delete from attribute where RELATION_ID = 'testEntity';
delete from entity_roles where ENTITY_ID = 'testEntity';
drop table testEntity;

delete from relation where RELATION_ID = 'r_testRelation';
delete from attribute where RELATION_ID = 'r_testRelation';
drop table r_testRelation;

insert into blog select * from (
SELECT 
   A.INSTANCE_GUID,
   max(case when C.ATTR_NAME = 'AUTHOR' then B.VALUE end) as AUTHOR,
   max(case when C.ATTR_NAME = 'ID' then B.VALUE end) as ID,
   max(case when C.ATTR_NAME = 'NUM_READS' then B.VALUE end) as NUM_READS,
   max(case when C.ATTR_NAME = 'PUBLISHED' then B.VALUE end) as PUBLISHED,
   max(case when C.ATTR_NAME = 'PUBLISH_TIME' then B.VALUE end) as PUBLISH_TIME,
   max(case when C.ATTR_NAME = 'TITLE' then B.VALUE end) as TITLE,
   max(case when C.ATTR_NAME = 'ABSTRACT' then B.VALUE end) as ABSTRACT,
   max(case when C.ATTR_NAME = 'NAME' then B.VALUE end) as NAME
 FROM MDB.ENTITY_INSTANCES as A
join VALUE as B
on A.INSTANCE_GUID = B.INSTANCE_GUID
join ATTRIBUTE as C
on B.ATTR_GUID = C.ATTR_GUID
where A.ENTITY_ID = 'blog'
  and A.DEL = 0
group by INSTANCE_GUID ) as D;

insert into r_comment select * from (
SELECT 
   max(case when C.ATTR_NAME = 'COMMENT' then B.VALUE end) as COMMENT,
   max(case when C.ATTR_NAME = 'IP_ADDRESS' then B.VALUE end) as IP_ADDRESS,
   max(case when C.ATTR_NAME = 'USER' then B.VALUE end) as USER,
   max(case when C.ATTR_NAME = 'SECTION_ID' then B.VALUE end) as SECTION_ID,
   max(case when C.ATTR_NAME = 'SUBMIT_TIME' then B.VALUE end) as SUBMIT_TIME,
   '' as INSTANCE_GUID,
   A.INSTANCE_GUID as COMMENT_GUID
 FROM MDB.ENTITY_INSTANCES as A
join VALUE as B
on A.INSTANCE_GUID = B.INSTANCE_GUID
join ATTRIBUTE as C
on B.ATTR_GUID = C.ATTR_GUID
where A.ENTITY_ID = 'blog_c'
  and A.DEL = 0
group by COMMENT_GUID ) as D;