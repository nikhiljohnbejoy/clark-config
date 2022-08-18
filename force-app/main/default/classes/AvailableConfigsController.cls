public with sharing class AvailableConfigsController {
    @AuraEnabled(cacheable=true)
    public static List<Config__c> getAvailableConfigs(){
        try {
            return [select Id, Label__c, Type__c, Amount__c from Config__c WITH SECURITY_ENFORCED];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static string saveCaseConfigs(Id caseId, List<Config__c> configList){
        try {
            String status;
            Set<String> existingLabels = getExistingCaseLabels();
            List<Case_Config__c> newCaseConfigs = getNewCaseConfigs(caseId, configList, existingLabels);
            if(newCaseConfigs.size() > 0){
                SObjectAccessDecision decision = Security.stripInaccessible(AccessType.CREATABLE, newCaseConfigs);
                insert decision.getRecords();
                status = 'Added '+decision.getRecords().size()+' new configs';
            }
            else{
                status = 'nonewinserts';
            }
            return status;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    private static Set<String> getExistingCaseLabels(){
        List<Case_Config__c> existingConfigs = [select Label__c from Case_Config__c WITH SECURITY_ENFORCED];
        Set<String> existingLabels = new Set<String>();
        for(Case_Config__c caseConf: existingConfigs) {
            existingLabels.add(caseConf.Label__c);
        }
        return existingLabels;
    }
    private static List<Case_Config__c> getNewCaseConfigs(Id caseId, List<Config__c> configList, Set<String> existingLabels){
        List<Case_Config__c> newCaseConfigs = new List<Case_Config__c>();
        for (Config__c conf: configList){
            if(!existingLabels.contains(conf.Label__c)){
                Case_Config__c tempConf = new Case_Config__c();
                tempConf.Label__c = conf.Label__c;
                tempConf.Amount__c = conf.Amount__c;
                tempConf.Type__c = conf.Type__c;
                tempConf.Case__c = caseId;
                newCaseConfigs.add(tempConf);
            }
        }
        return newCaseConfigs;
    }
}