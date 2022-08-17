public with sharing class CaseConfigsController {
    @AuraEnabled(cacheable=true)
    public static List<Case_Config__c> getCaseConfigs(Id caseId){
        try {
            return [select Id, Label__c, Type__c, Amount__c from Case_Config__c where Case__c =:caseId WITH SECURITY_ENFORCED];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
