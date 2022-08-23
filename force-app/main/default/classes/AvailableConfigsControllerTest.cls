@isTest
public with sharing class AvailableConfigsControllerTest {
    @TestSetup
    static void testLoadData() {
		List<Config__c> configList = Test.loadData(Config__c.sObjectType, 'Testdata_Config');
		System.assertEquals(configList.size(), 104, 'The static resource has 104 entries');
    }
    @isTest
    static void getAvailableConfigsTest() {
        List<Config__c> configList = AvailableConfigsController.getAvailableConfigs('Label__c', 'asc', 5, 0);
        System.assertEquals(configList.size(), 5, 'The getAvailableConfigs function returned 5 entries');
    }
    @isTest
    static void getAvailableConfigsErrorTest() {
        try{
    		AvailableConfigsController.getAvailableConfigs('Label__c', 'ascending', 5, 0);
		}catch (Exception e){
            system.assert(e instanceof AuraHandledException, 'An exception is thrown due to wrong sorting order');
        }
    }
    @isTest
    static void saveCaseConfigsTest() {
        Case test_case = new Case();
        insert test_case;
        List<Config__c> configList = [select Id from Config__c limit 10];
        List<Id> configIds = new List<Id>();
        for(Config__c conf: configList){
            configIds.add(conf.Id);
        }
        string status;
        
        status = AvailableConfigsController.saveCaseConfigs(test_case.id, configIds);
        System.assertEquals(status, 'Added '+configList.size()+' new configs', 'The saveCaseConfigs function successfully saved entries');
        
        status = AvailableConfigsController.saveCaseConfigs(test_case.id, configIds);
        System.assertEquals(status, 'NO_NEW_INSERTS', 'The saveCaseConfigs function informs that no new inserts occured');
        
        test_case.Sent_Case_Configs__c=true;
        update test_case;
        
        status = AvailableConfigsController.saveCaseConfigs(test_case.id, configIds);
        System.assertEquals(status, 'CONFIG_ALREADY_SENT', 'The saveCaseConfigs function informs that the case already has sent configs');
    }
    @isTest
    static void saveCaseConfigsErrorTest() {
        List<Config__c> configList = [select Id from Config__c limit 10];
        List<Id> configIds = new List<Id>();
        for(Config__c conf: configList){
            configIds.add(conf.Id);
        }
        try{
    		AvailableConfigsController.saveCaseConfigs(configIds.get(0), configIds);
		}catch (Exception e){
            system.assert(e instanceof AuraHandledException, 'An exception is thrown due to invalid case Id');
        }
    }
}