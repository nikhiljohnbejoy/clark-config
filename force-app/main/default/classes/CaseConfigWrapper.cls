public with sharing class CaseConfigWrapper {
    Id caseId;
    String status;
    List<CaseConfigFormatted> caseConfigs;
    public CaseConfigWrapper(Id caseId, String status, List<Case_Config__c> caseConfigs){
        this.caseId = caseId;
        this.status = status;
        List<CaseConfigFormatted> caseConfigsFormatted = new List<CaseConfigFormatted>();
        for( Case_Config__c conf: caseConfigs){
            CaseConfigFormatted tempCaseConf = new CaseConfigFormatted();
            tempCaseConf.label = conf.Label__c;
            tempCaseConf.type = conf.Type__c;
            tempCaseConf.amount = conf.Amount__c;
            caseConfigsFormatted.add(tempCaseConf);
        }
        this.caseConfigs = caseConfigsFormatted;
    }
    class CaseConfigFormatted{
        String label;
        String type;
        Decimal amount;
    }
}