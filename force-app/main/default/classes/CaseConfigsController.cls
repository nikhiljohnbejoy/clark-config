public with sharing class CaseConfigsController {
    @AuraEnabled(cacheable=true)
    public static List<Case_Config__c> getCaseConfigs(Id caseId, String field, String sortOrder){
        try {
            String query;
            query  = 'select Id, Label__c, Type__c, Amount__c from Case_Config__c where Case__c = :caseId WITH SECURITY_ENFORCED';
            if(field != null && sortOrder !=null){
                query += ' ORDER BY '+field+' '+sortOrder;
            }
            return Database.query(String.escapeSingleQuotes(query));
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static string sendConfigsToExternal(Id caseId, List<Case_Config__c> caseConfigs){
        String status;
        try {
            Case currentCase = [select Id, Status, Sent_Case_Configs__c from Case where Id =:caseId WITH SECURITY_ENFORCED];
            if(!currentCase.Sent_Case_Configs__c){
                HTTPResponse res = makeCallout(caseId, caseConfigs);
                if(res.getStatusCode() == 200){
                    updateCaseStatus(currentCase);
                    status = 'SUCCESS';
                }
                else{
                    status = 'CALLOUT_FAILED';
                }
            }
            else{
                status = 'HAS_SENT';
            }    
            return status;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    private static HTTPResponse makeCallout(Id caseId, List<Case_Config__c> caseConfigs){
        CaseConfigWrapper caseConfigWrapper = new caseConfigWrapper(caseId, 'Closed', caseConfigs);
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:Clark_RequestCatcher');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json;charset=UTF-8');
        req.setBody(JSON.serialize(caseConfigWrapper));
        Http http = new Http();
        HTTPResponse res = http.send(req);
        return res;
    }
    private static void updateCaseStatus(Case currentCase){
        currentCase.Status = 'Closed';
        currentCase.Sent_Case_Configs__c = true;
        update currentCase;
    }
}