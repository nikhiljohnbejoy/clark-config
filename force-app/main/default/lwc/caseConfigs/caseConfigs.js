import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { subscribe, unsubscribe, APPLICATION_SCOPE, MessageContext } from 'lightning/messageService';
import refreshCaseConfig from '@salesforce/messageChannel/RefreshCaseConfig__c';
import getCaseConfigs from '@salesforce/apex/CaseConfigsController.getCaseConfigs';
import LABEL_FIELD from '@salesforce/schema/Case_Config__c.Label__c';
import TYPE_FIELD from '@salesforce/schema/Case_Config__c.Type__c';
import AMOUNT_FIELD from '@salesforce/schema/Case_Config__c.Amount__c';
const Columns = [
    { label: 'Label', fieldName: LABEL_FIELD.fieldApiName, type: 'text' },
    { label: 'Type', fieldName: TYPE_FIELD.fieldApiName, type: 'text' },
    { label: 'Number', fieldName: AMOUNT_FIELD.fieldApiName, type: 'number' }
];
export default class CaseConfigs extends LightningElement {
    @api recordId;
    subscription = null;
    @wire(MessageContext)
    messageContext;
    @wire(getCaseConfigs, { caseId: '$recordId' })
    configs;
    columns = Columns;

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