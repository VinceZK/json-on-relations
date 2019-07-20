import { EntityPo } from './entity.po';

fdescribe('Entity App', () => {
  const page = new EntityPo();
  let malePersonUUID;
  let femalePersonUUID;

  describe('Search&List Page', () => {
    beforeAll( () => {
      page.navigateToSearch();
    });

    it('should list all the people when clicking button Search', () => {
      page.clickSearchButton();
      expect(page.getSearchResultList().count()).toEqual(3);
    });

    it('should list male people', () => {
      page.fillLowValue( 0, 'male');
      page.clickSearchButton();
      expect(page.getSearchResultList().count()).toEqual(2);
    });

    it('should list male people with height >= 175', () => {
      page.clickAddButton();
      page.fillFilterField(1, 'HEIGHT');
      page.fillOperator(1, 'GE');
      page.fillLowValue( 1, '175');
      page.clickSearchButton();
      expect(page.getSearchResultList().count()).toEqual(1);
    });

  });

  describe('Create&Copy Person', () => {
    it('should go to the create new person page', () => {
      page.clickNewButton();
      expect(page.getCurrentURL()).toEqual('http://localhost:4200/entity/new;entityID=person;action=new');
      expect(page.getRelationCards().count()).toEqual(6);
      expect(page.getFirstRelationCardHeader().getCssValue('color')).not.toEqual('rgba(169, 169, 169, 1)');
      expect(page.getLastRelationCardHeader().getCssValue('color')).toEqual('rgba(169, 169, 169, 1)');
    });

    it('should enable all the relations after filling person', () => {
      page.fillRelationPerson();
      expect(page.getLastRelationCardHeader().getCssValue('color')).not.toEqual('rgba(169, 169, 169, 1)');
    });

    it('should fail to save due to errors exist', () => {
      page.saveEntity();
      expect(page.getMessage()).toEqual('The form has errors, please check!');
    });

    it('should fill all the relations', () => {
      page.addAddress(0);
      page.addAddress(1);
      page.addEmail(0);
      page.addEmail(1);
      page.fillEmployee();
      page.fillPersonalization();
      page.fillUser();
      page.addRelationship('system_user', 'rs_user_role', 'permission', true);
    });

    it('should save the person entity successfully', () => {
      page.saveEntity();
      expect(page.getMessage()).toEqual('Entity instance is saved!');
      malePersonUUID = page.getEntityUUID();
    });

    it('should copy the male person into a female', () => {
      page.copyEntity();
      page.saveEntity();
      expect(page.getMessage()).toEqual('Entity instance is saved!');
      femalePersonUUID = page.getEntityUUID();
    });

  });

  describe('Change Person', () => {
    it('should add the marriage relationship', () => {
      page.switchDisplayEditMode();
      page.addRelationship('wife', 'rs_marriage', 'person');
      page.fillMarriagePartnerUUID(malePersonUUID);
      page.saveEntity();
      expect(page.getMessage()).toEqual('Entity instance is saved!');
    });

  });

  describe( 'Delete Person', () => {
    it('should delete the female person', () => {
      page.deleteEntity();
      expect(page.getCurrentURL()).toEqual('http://localhost:4200/entity/list');
      expect(page.getMessage()).toEqual('Entity instance is deleted!');
    });

    it('should delete the male person', () => {
      page.clickSearchButton();
      page.accessEntity(malePersonUUID);
      page.deleteEntity();
      expect(page.getCurrentURL()).toEqual('http://localhost:4200/entity/list');
      expect(page.getMessage()).toEqual('Entity instance is deleted!');
    });
  });

});
