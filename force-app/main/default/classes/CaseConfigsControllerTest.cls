@isTest
public with sharing class CaseConfigsControllerTest {
    @TestSetup
    static void testLoadData() {
		List<Config__c> configList = Test.loadData(Config__c.sObjectType, 'Testdata_Config');
		System.assertEquals(configList.size(), 104, 'The static resource has 104 entries');
        
        Case testCase = new Case();
        insert testCase;
        List<Config__c> addConfigList = [select Id from Config__c limit 10];
        List<Id> configIds = new List<Id>();
        for(Config__c conf: addConfigList){
            configIds.add(conf.Id);
        }
        AvailableConfigsController.saveCaseConfigs(testCase.id, configIds);
    }
    @isTest
    static void getCaseConfigsTest() {
        Case testCase = [Select Id from Case limit 1];
		List<Case_Config__c> configList = [select Id from Case_Config__c where Case__c =: testCase.Id];
        
        List<Case_Config__c> caseConfigList = CaseConfigsController.getCaseConfigs(testCase.Id, 'Label__c', 'asc');
        System.assertEquals(caseConfigList.size(), configList.size(), 'The getCaseConfigs function successfully returned entries');
        
    }
    @isTest
    static void getCaseConfigsErrorTest() {
        try{
            Case testCase = [Select Id from Case limit 1];
            List<Case_Config__c> configList = [select Id from Case_Config__c where Case__c =: testCase.Id];
    		CaseConfigsController.getCaseConfigs(testCase.Id, 'Label__c', 'ascending');
		}catch (Exception e){
            system.assert(e instanceof AuraHandledException, 'An exception is thrown due to wrong sorting order');
        }
    }
	@isTest
    static void sendConfigsToExternalTest() {
        Test.setMock(HttpCalloutMock.class, new CaseConfigRemoteMockImpl(200));
        Case testCase = [Select Id from Case limit 1];
        List<Case_Config__c> caseConfigs = [select Id, Label__c, Type__c, Amount__c from Case_Config__c where Case__c =: testCase.Id];
        string status;
        Test.startTest();
        status = CaseConfigsController.sendConfigsToExternal(testCase.Id, caseConfigs);
        System.assertEquals(status, 'SUCCESS', 'The sendConfigsToExternal function successfully sent configs');
        
        status = CaseConfigsController.sendConfigsToExternal(testCase.Id, caseConfigs);
        System.assertEquals(status, 'HAS_SENT', 'The sendConfigsToExternal function informs configs was sent already');
        Test.stopTest();
    }
    @isTest
    static void sendConfigsToExternalErrorTest() {
        try{
    		Test.setMock(HttpCalloutMock.class, new CaseConfigRemoteMockImpl(200));
            List<Case_Config__c> caseConfigs = [select Id, Label__c, Type__c, Amount__c from Case_Config__c limit 10];
            string status;
            Test.startTest();
            status = CaseConfigsController.sendConfigsToExternal(caseConfigs.get(0).Id, caseConfigs);
            Test.stopTest();
		}catch (Exception e){
            system.assert(e instanceof AuraHandledException, 'An exception is thrown due to invalid case Id');
        }
    }
    @isTest
    static void sendConfigsToExternalCallErrorTest() {
        Test.setMock(HttpCalloutMock.class, new CaseConfigRemoteMockImpl(404));
        Case testCase = [Select Id from Case limit 1];
        List<Case_Config__c> caseConfigs = [select Id, Label__c, Type__c, Amount__c from Case_Config__c where Case__c =: testCase.Id];
        string status;
        Test.startTest();
        status = CaseConfigsController.sendConfigsToExternal(testCase.Id, caseConfigs);
        System.assertEquals(status, 'CALLOUT_FAILED', 'The sendConfigsToExternal function informs callout has failed');
        Test.stopTest();
    }
}