import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import refreshCaseConfig from '@salesforce/messageChannel/RefreshCaseConfig__c';
import getAvailableConfigs from '@salesforce/apex/AvailableConfigsController.getAvailableConfigs';
import saveCaseConfigs from '@salesforce/apex/AvailableConfigsController.saveCaseConfigs';
import LABEL_FIELD from '@salesforce/schema/Config__c.Label__c';
import TYPE_FIELD from '@salesforce/schema/Config__c.Type__c';
import AMOUNT_FIELD from '@salesforce/schema/Config__c.Amount__c';
const Columns = [
    { label: 'Label', fieldName: LABEL_FIELD.fieldApiName, type: 'text', sortable: true },
    { label: 'Type', fieldName: TYPE_FIELD.fieldApiName, type: 'text', sortable: true },
    { label: 'Number', fieldName: AMOUNT_FIELD.fieldApiName, type: 'number', sortable: true }
];
const SUCCESS_TITLE = 'Success';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error in Adding configs';
const ERROR_VARIANT = 'error';
const INFO_NOCONFIG_TITLE = 'No available configs selected';
const INFO_SENT_TITLE = 'No action taken';
const INFO_NOCONFIG_MESSAGE = 'All selections are already added in case configs';
const INFO_SELECTION_MESSAGE = 'Please select configs to be added';
const INFO_SENT_MESSAGE = 'The case configs have already been sent';
const INFO_VARIANT = 'info';
export default class AvailableConfigs extends LightningElement {
    @api recordId;
    columns=Columns;
    sortBy= LABEL_FIELD.fieldApiName;
    sortDirection= 'asc';
    @wire(getAvailableConfigs,{field : '$sortBy',sortOrder : '$sortDirection'})
    configs;
    @wire(MessageContext)
    messageContext;
    disableAddButton = false;
    selectedConfigIds = [];

    addCaseConfigs(){
        let selectedRecords =  this.template.querySelector("lightning-datatable").getSelectedRows();
        if(selectedRecords.length > 0){
            saveCaseConfigs({ caseId: this.recordId, configList: selectedRecords})
            .then((result) => {
                if(result === 'nonewinserts'){
                    this.showNotification(INFO_NOCONFIG_TITLE, INFO_NOCONFIG_MESSAGE, INFO_VARIANT);
                }
                else if(result === 'CONFIG_ALREADY_SENT'){
                    this.showNotification(INFO_SENT_TITLE, INFO_SENT_MESSAGE, INFO_VARIANT);
                    this.disableAddButton = true;
                }
                else{
                    publish(this.messageContext, refreshCaseConfig, {});
                    this.showNotification(SUCCESS_TITLE, result, SUCCESS_VARIANT);
                }
                this.selectedConfigIds = [];
            })
            .catch((error) => {
                this.showNotification(ERROR_TITLE, error.message, ERROR_VARIANT);
            });
        }
        else{
            this.showNotification(INFO_NOCONFIG_TITLE, INFO_SELECTION_MESSAGE, INFO_VARIANT);
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
    doSorting(event) {
        // calling sortdata function to sort the data based on direction and selected field
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
    }
}