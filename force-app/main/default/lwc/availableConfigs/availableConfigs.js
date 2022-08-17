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
    { label: 'Label', fieldName: LABEL_FIELD.fieldApiName, type: 'text' },
    { label: 'Type', fieldName: TYPE_FIELD.fieldApiName, type: 'text' },
    { label: 'Number', fieldName: AMOUNT_FIELD.fieldApiName, type: 'number' }
];
const SUCCESS_TITLE = 'Success';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error in Adding configs';
const ERROR_VARIANT = 'error';
const INFO_TITLE = 'No available configs selected';
const INFO_MESSAGE = 'All selections are already added in case configs';
const INFO_VARIANT = 'info';
export default class AvailableConfigs extends LightningElement {
    @api recordId;
    columns=Columns;
    @wire(getAvailableConfigs)
    configs;
    @wire(MessageContext)
    messageContext;

    selectedConfigIds = [];
    addCaseConfigs(){
        let selectedRecords =  this.template.querySelector("lightning-datatable").getSelectedRows();
        if(selectedRecords.length > 0){
            saveCaseConfigs({ caseId: this.recordId, configList: selectedRecords})
            .then((result) => {
                if(result === 'nonewinserts'){
                    const evt = new ShowToastEvent({
                        title: INFO_TITLE,
                        message: INFO_MESSAGE,
                        variant: INFO_VARIANT,
                    });
                    this.dispatchEvent(evt);
                }
                else{
                    //send refresh message
                    const evt = new ShowToastEvent({
                        title: SUCCESS_TITLE,
                        message: result,
                        variant: SUCCESS_VARIANT,
                    });
                    this.dispatchEvent(evt);
                    publish(this.messageContext, refreshCaseConfig, {});
                }
                this.selectedConfigIds = [];
            })
            .catch((error) => {
                const evt = new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: error.message,
                    variant: ERROR_VARIANT,
                });
                this.dispatchEvent(evt);
            });
        }   
    }
}
