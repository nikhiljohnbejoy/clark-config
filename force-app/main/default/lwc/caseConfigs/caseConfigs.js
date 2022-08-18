import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { subscribe, unsubscribe, APPLICATION_SCOPE, MessageContext } from 'lightning/messageService';
import refreshCaseConfig from '@salesforce/messageChannel/RefreshCaseConfig__c';
import getCaseConfigs from '@salesforce/apex/CaseConfigsController.getCaseConfigs';
import sendConfigsToExternal from '@salesforce/apex/CaseConfigsController.sendConfigsToExternal';
import LABEL_FIELD from '@salesforce/schema/Case_Config__c.Label__c';
import TYPE_FIELD from '@salesforce/schema/Case_Config__c.Type__c';
import AMOUNT_FIELD from '@salesforce/schema/Case_Config__c.Amount__c';
const Columns = [
    { label: 'Label', fieldName: LABEL_FIELD.fieldApiName, type: 'text' },
    { label: 'Type', fieldName: TYPE_FIELD.fieldApiName, type: 'text' },
    { label: 'Number', fieldName: AMOUNT_FIELD.fieldApiName, type: 'number' }
];
const SUCCESS_TITLE = 'Success';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error in Sending configs';
const ERROR_VARIANT = 'error';
const INFO_TITLE = 'No action taken';
const INFO_MESSAGE = 'No case configs to send';
const INFO_VARIANT = 'info';
export default class CaseConfigs extends LightningElement {
    @api recordId;
    subscription = null;
    @wire(MessageContext)
    messageContext;
    @wire(getCaseConfigs, { caseId: '$recordId' })
    configs;
    columns = Columns;

    sendCaseConfigs(){
        //On "SEND": Sets the status of the Case to "Closed".
        //On "SEND": A Post request is sent to an external service.
        if(this.configs.data.length > 0){
            sendConfigsToExternal({ caseId: this.recordId, caseConfigs: this.configs.data})
            .then((result) => {
                console.log('HERE');
                if(result === 'success'){
                    const evt = new ShowToastEvent({
                        title: SUCCESS_TITLE,
                        message: result,
                        variant: SUCCESS_VARIANT,
                    });
                    this.dispatchEvent(evt);
                }
            })
            .catch((error) => {
                const evt = new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: error.message,
                    variant: ERROR_VARIANT,
                });
                this.dispatchEvent(evt);
            });
        //On "SEND": Send option is no longer available.
        //On "SEND": User cannot add any more Configs.
        }
        else{
            const evt = new ShowToastEvent({
                title: INFO_TITLE,
                message: INFO_MESSAGE,
                variant: INFO_VARIANT,
            });
            this.dispatchEvent(evt);
        }
    }

    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                refreshCaseConfig,
                (message) => this.handleMessage(message),
                { scope: APPLICATION_SCOPE }
            );
        }
    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    handleMessage(message) {
        refreshApex(this.configs);
    }

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }
}