global class CaseConfigRemoteMockImpl implements HttpCalloutMock {
    Integer status;
    public CaseConfigRemoteMockImpl(Integer status){
        this.status = status;
    }
    global HTTPResponse respond(HTTPRequest req) {
        System.assertEquals('callout:Clark_RequestCatcher', req.getEndpoint());
        System.assertEquals('POST', req.getMethod());
        
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody('{}');
        res.setStatusCode(this.status);
        return res;
    }
}