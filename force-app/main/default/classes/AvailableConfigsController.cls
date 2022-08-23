public with sharing class AvailableConfigsController {
    @AuraEnabled(cacheable=true)
    public static List<Config__c> getAvailableConfigs(String field, String sortOrder, Integer queryLimit, Integer queryOffset){
        try {
            String query;
            query  = 'select Id, Label__c, Type__c, Amount__c from Config__c WITH SECURITY_ENFORCED';
            if(field != null && sortOrder !=null){
                query += ' ORDER BY '+field+' '+sortOrder;
            }
            if(queryLimit !=null && queryOffset!=null){
                query +=' limit :queryLimit offset :queryOffset';
            }
            return Database.query(String.escapeSingleQuotes(query));
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static string saveCaseConfigs(Id caseId, List<Id> configIds){
        String status;
        try {
            Case currentCase = [select Id, Status, Sent_Case_Configs__c from Case where Id =:caseId WITH SECURITY_ENFORCED];
            if(!currentCase.Sent_Case_Configs__c){
                Set<String> requestedLabels = new Set<String>();
                List<Config__c> configList = [select Label__c, Type__c, Amount__c from Config__c WHERE Id in :configIds WITH SECURITY_ENFORCED];
                for(Config__c conf: configList) {
                    requestedLabels.add(conf.Label__c);
                }
                Set<String> existingLabels = getExistingCaseLabels(requestedLabels);
                List<Case_Config__c> newCaseConfigs = getNewCaseConfigs(caseId, configList, existingLabels);
                if(newCaseConfigs.size() > 0){
                    SObjectAccessDecision decision = Security.stripInaccessible(AccessType.CREATABLE, newCaseConfigs);
                    insert decision.getRecords();
                    status = 'Added '+decision.getRecords().size()+' new configs';
                }
                else{
                    status = 'NO_NEW_INSERTS';
                }
            }
            else{
                status = 'CONFIG_ALREADY_SENT';
            }
            return status;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    private static Set<String> getExistingCaseLabels(Set<String> requestedLabels){
        List<Case_Config__c> existingConfigs = [select Label__c from Case_Config__c where Label__c IN: requestedLabels WITH SECURITY_ENFORCED];
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