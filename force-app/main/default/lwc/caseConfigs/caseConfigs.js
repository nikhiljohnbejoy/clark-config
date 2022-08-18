import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';
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
const SUCCESS_MESSAGE = 'The case configs were sent successfully';
const ERROR_TITLE = 'Error in Sending configs';
const ERROR_VARIANT = 'error';
const ERROR_CALLOUT_MESSAGE = 'The configs could not be sent';
const INFO_TITLE = 'No action taken';
const INFO_NONE_MESSAGE = 'No case configs to send';
const INFO_SENT_MESSAGE = 'The case configs have already been sent';
const INFO_VARIANT = 'info';
export default class CaseConfigs extends LightningElement {
    @api recordId;
    subscription = null;
    @wire(MessageContext)
    messageContext;
    @wire(getCaseConfigs, { caseId: '$recordId' })
    configs;
    columns = Columns;
    disableSendButton = false;
    isLoading = false;
    sendCaseConfigs(){
        if(this.configs.data.length > 0){
            this.isLoading = true;
            sendConfigsToExternal({ caseId: this.recordId, caseConfigs: this.configs.data})
            .then((result) => {
                this.isLoading = false;
                if(result === 'SUCCESS'){
                    this.showNotification(SUCCESS_TITLE, SUCCESS_MESSAGE, SUCCESS_VARIANT);
                    this.disableSendButton = true;
                    getRecordNotifyChange([{recordId: this.recordId}]);
                }
                else if(result === 'CALLOUT_FAILED'){
                    this.showNotification(ERROR_TITLE, ERROR_CALLOUT_MESSAGE, ERROR_VARIANT);
                }
                else if(result === 'HAS_SENT'){
                    this.showNotification(INFO_TITLE, INFO_SENT_MESSAGE, INFO_VARIANT);
                    this.disableSendButton = true;
                }
            })
            .catch((error) => {
                this.isLoading = false;
                this.showNotification(ERROR_TITLE, error.message, ERROR_VARIANT);
            });
        }
        else{
            this.showNotification(INFO_TITLE, INFO_NONE_MESSAGE, INFO_VARIANT);
        }
    }
    showNotification(toastTitle, toastMessage, toastVariant) {
        const evt = new ShowToastEvent({
            title: toastTitle,
            message: toastMessage,
            variant: toastVariant,
        });
        this.dispatchEvent(evt);
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