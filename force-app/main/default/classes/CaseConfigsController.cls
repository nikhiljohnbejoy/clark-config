public with sharing class CaseConfigsController {
    @AuraEnabled(cacheable=true)
    public static List<Case_Config__c> getCaseConfigs(Id caseId){
        try {
            return [select Id, Label__c, Type__c, Amount__c from Case_Config__c where Case__c =:caseId WITH SECURITY_ENFORCED];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static string sendConfigsToExternal(Id caseId, List<Case_Config__c> caseConfigs){
        try {
        //On "SEND": A Post request is sent to an external service.
        HTTPResponse res = makeCallout(caseId, caseConfigs);
        System.debug(res.getBody());
        //On "SEND": Sets the status of the Case to "Closed".
        Case currentCase = [select Id, Status from Case where Id =:caseId WITH SECURITY_ENFORCED];
        if(currentCase.Status != 'Closed'){
            currentCase.Status = 'Closed';
            update currentCase;
        }
        
        return 'success';
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
}