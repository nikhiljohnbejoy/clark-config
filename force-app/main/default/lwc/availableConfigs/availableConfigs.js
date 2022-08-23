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
    limit = 5;
    offset = 0;
    noOfPages=0;
    currentPage=0;
    pages = [];
    @wire(MessageContext)
    messageContext;
    disableAddButton = false;
    selectedConfigIds = [];
    isLoading = false;
    isSortTrigger = true;
    hasNoMorePages = false;
    configsMap = new Map();
    selectedConfigsMap = new Map();
    configs;
    error;
    @wire(getAvailableConfigs,{field : '$sortBy', sortOrder : '$sortDirection', queryLimit : '$limit', queryOffset : '$offset'})
    getAllConfigs({ error, data }) {
        if (data) {
            if(this.isSortTrigger){
                this.noOfPages=0;
                this.pages=[];
                this.isSortTrigger=false;
            }
            if(data.length != 0){
                this.addPage();
                //this.configs = data;
                this.configsMap.set(this.noOfPages,data);
                this.navigateToPage(this.noOfPages);
                this.hasNoMorePages = false;
            }
            else{
                this.hasNoMorePages = true;
            }
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.configs = undefined;
        }
    }

    addCaseConfigs(){
        let selectedRecords =  this.template.querySelector("lightning-datatable").getSelectedRows();
        if(selectedRecords.length > 0){
            this.isLoading = true;
            saveCaseConfigs({ caseId: this.recordId, configList: selectedRecords})
            .then((result) => {
                this.isLoading = false;
                if(result === 'NO_NEW_INSERTS'){
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
                this.isLoading = false;
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
        this.isSortTrigger = true;
        this.selectedConfigIds = [];
        this.offset=0;
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
    }
    get isPrevDisabled(){
        return (this.pages.length<2) || (this.currentPage == 1);
    }
    get isNextDisabled(){
        return (this.configs && (this.configs.length < this.limit)) || this.hasNoMorePages;
    }
    gotoNext(){
        if(this.currentPage < this.noOfPages){
            this.navigateToPage(this.currentPage+1);
        }
        else{
            this.offset +=this.limit;
        }
    }
    gotoPage(event){
        this.navigateToPage(parseInt(event.target.dataset.id));
    }
    gotoPrevious(){
        this.navigateToPage(this.currentPage-1);
    }
    navigateToPage(pageNo){
        if(this.currentPage != 0){
            const oldSelectedButton = this.template.querySelector('[data-id=\''+this.currentPage+'\']');
            oldSelectedButton.classList.remove('current-page');
        }
        this.configs = this.configsMap.get(pageNo);
        this.currentPage = pageNo;
        const currentButton = this.template.querySelector('[data-id=\''+pageNo+'\']');
        if(currentButton){
            currentButton.classList.add('current-page');
        }
    }
    addPage(){
        this.noOfPages+=1;
        //this.currentPage=this.noOfPages;
        this.pages = [...this.pages, this.noOfPages];
    }
}