import { browser, by, element } from 'protractor';

export class EntityPo {
  navigateToSearch() {
    return browser.get('/entity/list');
  }

  clickSearchButton() {
    element(by.buttonText('Search')).click();
  }

  getSearchResultList() {
    return element.all(by.css('.ht_master table.htCore>tbody>tr'));
  }

  fillLowValue(index: number, value: string) {
    element.all(by.name('low')).get(index).sendKeys(value);
  }

  clickAddButton() {
    element(by.buttonText('Add')).click();
  }

  fillFilterField(index: number, value: string) {
    element.all(by.name('filterField')).get(index)
      .element(by.css('option[value="' + value + '"]')).click();
  }

  fillOperator(index: number, value: string) {
    element.all(by.name('operator')).get(index)
      .element(by.css('option[value="' + value + '"]')).click();
  }

  clickNewButton() {
    element(by.buttonText('New')).click();
  }

  getCurrentURL() {
    return browser.getCurrentUrl();
  }

  getRelationCards() {
    return element.all(by.tagName('app-entity-relation'));
  }

  getFirstRelationCardHeader() {
    return this.getRelationCards().first().element(by.className('card-header'));
  }

  getLastRelationCardHeader() {
    return this.getRelationCards().last().element(by.className('card-header'));
  }

  fillRelationPerson() {
    const card = element(by.id('person_person'));
    const gender = card.element(by.css('input[ng-reflect-name="GENDER"]'));
    const height = card.element(by.css('input[ng-reflect-name="HEIGHT"]'));
    const hobby = card.element(by.css('input[ng-reflect-name="HOBBY"]'));
    const fingerPrint = card.element(by.css('input[ng-reflect-name="FINGER_PRINT"]'));
    const type = card.element(by.css('input[ng-reflect-name="TYPE"]'));
    const systemAccess = card.element(by.css('input[ng-reflect-name="SYSTEM_ACCESS"]'));
    gender.clear().then(() => gender.sendKeys('male'));
    height.clear().then(() => height.sendKeys('175'));
    hobby.clear().then(() => hobby.sendKeys('Coding'));
    fingerPrint.clear().then(() => fingerPrint.sendKeys('AK47'));
    type.clear().then(() => type.sendKeys('employee'));
    systemAccess.clear().then(() => systemAccess.sendKeys('portal'));
    element(by.css('button[title="Refresh Roles"]')).click();
  }

  saveEntity() {
    element(by.css('button[title="Save Entity"]')).click();
  }

  getMessage() {
    return element(by.css('.dk-message a.alert-link')).getText();
  }

  addAddress(index: number) {
    element(by.css('button[name="r_address"]')).click();
    const addressTable = element(by.css('tbody[ng-reflect-name="r_address"]'));
    const type = addressTable.all(by.css('input[ng-reflect-name="TYPE"]')).get(index);
    const addressValue = addressTable.all(by.css('input[ng-reflect-name="ADDRESS_VALUE"]')).get(index);
    const postCode = addressTable.all(by.css('input[ng-reflect-name="POSTCODE"]')).get(index);
    const city = addressTable.all(by.css('input[ng-reflect-name="CITY"]')).get(index);
    const country = addressTable.all(by.css('input[ng-reflect-name="COUNTRY"]')).get(index);
    const primary = addressTable.all(by.css('input[ng-reflect-name="PRIMARY"]')).get(index);
    type.clear().then(() => type.sendKeys( index ? 'work' : 'home'));
    addressValue.clear().then(() => addressValue.sendKeys('#xxx Road xxxx'));
    postCode.clear().then(() => postCode.sendKeys('200000'));
    city.clear().then(() => city.sendKeys('Shanghai'));
    country.clear().then(() => country.sendKeys('China'));
    primary.clear().then(() => primary.sendKeys(index));
  }

  addEmail(index: number) {
    if (index) { element(by.css('button[name="r_email"]')).click(); }
    const emailTable = element(by.css('tbody[ng-reflect-name="r_email"]'));
    const email = emailTable.all(by.css('input[ng-reflect-name="EMAIL"]')).get(index);
    const type = emailTable.all(by.css('input[ng-reflect-name="TYPE"]')).get(index);
    const primary = emailTable.all(by.css('input[ng-reflect-name="PRIMARY"]')).get(index);
    email.clear().then(() => email.sendKeys('DH099_' + index + '@darkhouse.com.cn'));
    type.clear().then(() => type.sendKeys(index ? 'work' : 'private'));
    primary.clear().then(() => primary.sendKeys(index));
  }

  fillEmployee() {
    const card = element(by.id('employee_r_employee'));
    const userID = card.element(by.css('input[ng-reflect-name="USER_ID"]'));
    const title = card.element(by.css('input[ng-reflect-name="TITLE"]'));
    const gender = card.element(by.css('input[ng-reflect-name="GENDER"]'));
    const companyID = card.element(by.css('input[ng-reflect-name="COMPANY_ID"]'));
    const departmentID = card.element(by.css('input[ng-reflect-name="DEPARTMENT_ID"]'));
    userID.clear().then(() => userID.sendKeys('DH099'));
    title.clear().then(() => title.sendKeys('Architect'));
    gender.clear().then(() => gender.sendKeys('male'));
    companyID.clear().then(() => companyID.sendKeys('darkhouse'));
    departmentID.clear().then(() => departmentID.sendKeys('development'));
  }

  fillPersonalization() {
    element(by.css('button[name="r_personalization"]')).click();
    const card = element(by.id('system_user_r_personalization'));
    const userID = card.element(by.css('input[ng-reflect-name="USER_ID"]'));
    const language = card.element(by.css('input[ng-reflect-name="LANGUAGE"]'));
    const decimalFormat = card.element(by.css('input[ng-reflect-name="DECIMAL_FORMAT"]'));
    const timezone = card.element(by.css('input[ng-reflect-name="TIMEZONE"]'));
    const dateFormat = card.element(by.css('input[ng-reflect-name="DATE_FORMAT"]'));
    userID.clear().then(() => userID.sendKeys('DH099'));
    language.clear().then(() => language.sendKeys('ZH'));
    decimalFormat.clear().then(() => decimalFormat.sendKeys('000,000.00'));
    timezone.clear().then(() => timezone.sendKeys('UTC+8'));
    dateFormat.clear().then(() => dateFormat.sendKeys('YYYY/MM/DD'));
  }

  fillUser() {
    const card = element(by.id('system_user_r_user'));
    const userID = card.element(by.css('input[ng-reflect-name="USER_ID"]'));
    const userName = card.element(by.css('input[ng-reflect-name="USER_NAME"]'));
    const displayName = card.element(by.css('input[ng-reflect-name="DISPLAY_NAME"]'));
    const givenName = card.element(by.css('input[ng-reflect-name="GIVEN_NAME"]'));
    const familyName = card.element(by.css('input[ng-reflect-name="FAMILY_NAME"]'));
    const password = card.element(by.css('input[ng-reflect-name="PASSWORD"]'));
    const pwdState = card.element(by.css('input[ng-reflect-name="PWD_STATE"]'));
    userID.clear().then(() => userID.sendKeys('DH099'));
    userName.clear().then(() => userName.sendKeys('HL123'));
    displayName.clear().then(() => displayName.sendKeys('YellowHuang'));
    givenName.clear().then(() => givenName.sendKeys('Li'));
    familyName.clear().then(() => familyName.sendKeys('Huang'));
    password.clear().then(() => password.sendKeys('dark1234'));
    pwdState.clear().then(() => pwdState.sendKeys('1'));
  }

  addRelationship(selfRole: string, relationship: string, partnerEntity: string, confirm?: boolean) {
    element(by.partialButtonText(' Add Relationship')).click();
    const addRelationshipModal = element(by.id('addRelationshipModal'));
    addRelationshipModal.element(by.name('self_role'))
      .element(by.css('option[value="' + selfRole + '"]')).click();
    addRelationshipModal.element(by.name('relationship_id'))
      .element(by.css('option[value="' + relationship + '"]')).click();
    addRelationshipModal.element(by.buttonText('Confirm')).click();
    const addRelationshipCard = element(by.id(relationship));
    addRelationshipCard.element(by.css('button[name="' + relationship + '"]')).click();
    const addRelationshipInstanceModal = element(by.css('div[id="' + relationship + '"] ~ div[id="addRelationshipInstanceModal"]'));
    addRelationshipInstanceModal.element(by.name('partner_entity_id'))
      .element(by.css('option[value="' + partnerEntity + '"]')).click();
    addRelationshipInstanceModal.element(by.css('button[name="searchInstanceGUID"]')).click();
    const searchHelpModal = element(by.css('div[id="' + relationship + '"] ~ dk-app-search-help'));
    searchHelpModal.element(by.css('button[id="search"]')).click();
    searchHelpModal.element(by.css('tbody>tr>td>input')).click();
    searchHelpModal.element(by.buttonText('Confirm')).click();
    if (confirm) {
      addRelationshipInstanceModal.element(by.buttonText('Confirm')).click();
    }
  }

  getEntityUUID() {
    return element(by.css('nav span.mb-0.ml-2')).getText();
  }

  fillMarriagePartnerUUID(UUID: string) {
    const addRelationshipInstanceModal = element(by.css('div[id="rs_marriage"] ~ div[id="addRelationshipInstanceModal"]'));
    const partnerUUID = addRelationshipInstanceModal.element(by.name('partner_instance_guid'));
    partnerUUID.clear().then(() => partnerUUID.sendKeys(UUID));
    addRelationshipInstanceModal.element(by.css('input[ng-reflect-name="REG_PLACE"]')).sendKeys('Haimen');
    addRelationshipInstanceModal.element(by.css('input[ng-reflect-name="COUNTRY"]')).sendKeys('China');
    addRelationshipInstanceModal.element(by.buttonText('Confirm')).click();
  }

  copyEntity() {
    element(by.css('button[title="Copy Entity"]')).click();
    const card = element(by.id('person_person'));
    const gender = card.element(by.css('input[ng-reflect-name="GENDER"]'));
    const height = card.element(by.css('input[ng-reflect-name="HEIGHT"]'));
    const hobby = card.element(by.css('input[ng-reflect-name="HOBBY"]'));
    const fingerPrint = card.element(by.css('input[ng-reflect-name="FINGER_PRINT"]'));
    gender.clear().then(() => gender.sendKeys('female'));
    height.clear().then(() => height.sendKeys('165'));
    hobby.clear().then(() => hobby.sendKeys('Drama'));
    fingerPrint.clear().then(() => fingerPrint.sendKeys('AKM'));

    const emailTable = element(by.css('tbody[ng-reflect-name="r_email"]'));
    const email = emailTable.all(by.css('input[ng-reflect-name="EMAIL"]')).get(0);
    email.clear().then(() => email.sendKeys('DH098_' + 0 + '@darkhouse.com.cn'));
    emailTable.all(by.css('button[title="Delete"]')).get(1).click();

    element(by.id('employee_r_employee'))
      .element(by.css('input[ng-reflect-name="USER_ID"]'))
      .sendKeys('DH098');

    element(by.id('system_user_r_personalization'))
      .element(by.css('input[ng-reflect-name="USER_ID"]'))
      .sendKeys('DH098');

    element(by.id('system_user_r_user'))
      .element(by.css('input[ng-reflect-name="USER_ID"]'))
      .sendKeys('DH098');
  }

  switchDisplayEditMode() {
    element(by.css('button[title="Switch Display Edit Mode"]')).click();
  }

  deleteEntity() {
    element(by.css('button[title="Delete Entity"]')).click();
    const deletionConfirmationModal = element(by.id('deletionConfirmation'));
    deletionConfirmationModal.element(by.buttonText('Confirm')).click();
  }

  accessEntity(UUID: string) {
    element(by.linkText(UUID)).click();
  }
}
