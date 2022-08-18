# Salesforce Project: Clark Technical Assignment

This is the github repository for the development of the below user story.

As a Consultant,
I have a related list with available Configs from which I can select Configs and add them to the Case.
So that, I can add new records and activate them without leaving the Case page.
Users would like to be able to add Config records to Case without leaving the Case detail page. Users
should see two custom related lists on the detail page Case:
1. `Available Configs` - displays all available Config records.
2. `Case Configs` – displays Configs added to the current Case


## Initial understanding of the requirement

The user story requires the ability to add configs to a case object. There is a need to create two custom objects in the salesforce org for this requirement. They are `Config__c` and `Case_Config__c`. 

1. `Config__c` should contain records which corresponds to the available configs a user can choose from.
2. `Case_Config__c` will be used to store the configs assosiated with a case once added to the case by the user.

The user story requires to create two custom components `Available Configs` and `Case Configs`.

1. The `Available Configs` component displays information about the `Config__c` objects in a table. There is an option to select multiple records and "ADD" them to the `Case Configs` list. (If a Config record has already been added to the `Case Configs` list it cannot be added a second time.)

2. The `Case Configs` component displays information about the `Case_Config__c` objects assosiated with the current case in a table.
    The component has an “Send” button which performs the followig action:
    1. Sets the status of the Case to "Closed".
    2. A Post request is sent to an external service.
    3. User cannot add any more Configs.
    4. Send option is no longer available.

**Important**: 
1. When a user adds new Config records from the `Available Configs`, new records appear in the `Case Configs` list without having to refresh the page.
2. Errors of the external system need to be handled.

_Optional Requirements_:
1. Sort records by any column in `Available Configs` and `Case Configs` components.
2. Add pagination in the `Available Configs` component (there can be more than 200 records).

## Tasks assosiated with the user story

The user story can be divided into the following tasks and subtasks.

**TASKS**:
1. Creation of custom objects for the `Available Configs` and `Case Configs`.<br/>
    _Subtasks_
    - [x] Create custom object `Config__c` and the fields _Label_ (Text, Unique), _Type_ (Text), _Amount_ (Number).
    - [x] Create custom object `Case_Config__c` and the fields _Label_ (Text, Unique), _Type_ (Text), _Amount_ (Number), _Case_ (Lookup to Case object). 

2. Creation of the `Available Configs` lightning web component.<br/>
    _Subtasks_
    - [x] Create a new lwc component with name availableConfigs.
    - [x] Create a apex controller to retrieve the list of configs.
    - [ ] Wrtie test class to validate the apex class functionality.
    - [x] Display the available configs in a tabular format.
    - [x] It should be possible to select multiple records in the list view.
    - [x] Create an "ADD" button to send the selected configs to the `Case Configs` list.
    - [x] Create a LightningMessageChannel for communicating to the `Case Configs` component.
    - [ ] _Optional_ : Sort records by any column in the list.
    - [ ] _Optional_ : Add Pagination to the list.
    - [ ] _Optional_ : Testing of the LwC component.

3. Creation of the `Case Configs` lightning web component.<br/>
    _Subtasks_
    - [x] Create a new lwc component with name caseConfigs.
    - [x] Create a apex controller to retrieve the list of case configs and callout.
    - [ ] Write test class to validate the apex class functionality.
    - [x] Display the case configs in a tabular format.
    - [x] Create an "SEND" button to send the configs.
    - [x] On "SEND": Sets the status of the Case to "Closed".
    - [x] On "SEND": A Post request is sent to an external service. _(Adding NamedCredential, wrapper class, sending request, Handling Error)_
    - [ ] On "SEND": User cannot add any more Configs.
    - [ ] On "SEND": Send option is no longer available.
    - [ ] _Optional_ : Sort records by any column in the list.
    - [ ] _Optional_ : Testing of the LwC component.

## Understandings and Notes
- `Case_Config__c` - fields: `Label` (Text, **Unique**) , which means that a particular `Config__c` configuration can be assosiated with one case only.
- Restriction of addition of existing configs to the case configs to be done on the `Case Configs` component since in the future there can be another component which needs to interact with the `Available Configs` component in the case detail page and we should not hide/disable the options because they exist in `Case Configs`.
