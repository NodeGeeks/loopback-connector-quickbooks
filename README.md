# loopback-connector-quickbooks

**This connector is currently under development and should not be used in production, get involved and help us speed up 
development by taking a look at the TODO section**

The purpose of this connector is to act as the middle and end man in the process of communication to QuickBooks Web 
Connector used to communicate to QuickBooks Desktop software. Traditionally QuickBooks Web Connector requires a SOAP 
server to send and receive XML requests to view, create or update QuickBooks data. This connector has a built in SOAP 
server built in. The connector itself is responsible intaking a traditional RESTful API request, and using the SOAP 
service to communicate it to the QuickBooks Web Connector.

Big thanks to [johnballantyne](https://github.com/johnballantyne?tab=overview&from=2016-08-01&to=2016-08-31&utf8=%E2%9C%93). 
The built in SOAP service is based upon his implementation of [Node.js QBWebConnector service](https://github.com/johnballantyne/qbws) 
with modifications to support dynamic queries.

## Install connector from NPM

    npm install loopback-connector-quickbooks --save

## Configuring elastic connector
Edit **datasources.json** and set:

    "quickbooksDataSource" : {
        "wsdlURL": "http://localhost:2188/wsdl?WSDL",
        "name": "quickbooksDataSource",
        "connector": "quickbooks",
        "companyFile": "C:\\Users\\Public\\Documents\\Intuit\\QuickBooks\\Sample Company Files\\sample business.qbw",
        "username": "qbuser",
        "password": "pas***rd1234"
    }
    
Settings:
---------
- **wsdlURL:** URL pointing to the wsdl server
- **username:** Username used in the .QWC file created for your server
- **password:** Password set in QuickBooks Web Connector


## TODO
  * Add method to insure that the only data getting returns is data that is defined within the `model.json properties`

## Release notes

  * Beta v0.01 released