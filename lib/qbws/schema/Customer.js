/**
 * Created by aaronrussell on 10/1/16.
 */

module.exports = {
  modelName: 'Customer',
  POST: {
    "Name": "STRTYPE",
    "IsActive": "BOOLTYPE",
    "ClassRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "ParentRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "CompanyName": "STRTYPE",
    "Salutation": "STRTYPE",
    "FirstName": "STRTYPE",
    "MiddleName": "STRTYPE",
    "LastName": "STRTYPE",
    "JobTitle": "STRTYPE",
    "BillAddress": {
      "Addr1": "STRTYPE",
      "Addr2": "STRTYPE",
      "Addr3": "STRTYPE",
      "Addr4": "STRTYPE",
      "Addr5": "STRTYPE",
      "City": "STRTYPE",
      "State": "STRTYPE",
      "PostalCode": "STRTYPE",
      "Country": "STRTYPE",
      "Note": "STRTYPE"
    },
    "ShipAddress": {
      "Addr1": "STRTYPE",
      "Addr2": "STRTYPE",
      "Addr3": "STRTYPE",
      "Addr4": "STRTYPE",
      "Addr5": "STRTYPE",
      "City": "STRTYPE",
      "State": "STRTYPE",
      "PostalCode": "STRTYPE",
      "Country": "STRTYPE",
      "Note": "STRTYPE"
    },
    "ShipToAddress": {
      "Name": "STRTYPE",
      "Addr1": "STRTYPE",
      "Addr2": "STRTYPE",
      "Addr3": "STRTYPE",
      "Addr4": "STRTYPE",
      "Addr5": "STRTYPE",
      "City": "STRTYPE",
      "State": "STRTYPE",
      "PostalCode": "STRTYPE",
      "Country": "STRTYPE",
      "Note": "STRTYPE",
      "DefaultShipTo": "BOOLTYPE"
    },
    "Phone": "STRTYPE",
    "AltPhone": "STRTYPE",
    "Fax": "STRTYPE",
    "Email": "STRTYPE",
    "Cc": "STRTYPE",
    "Contact": "STRTYPE",
    "AltContact": "STRTYPE",
    "AdditionalContactRef": {
      "ContactName": "STRTYPE",
      "ContactValue": "STRTYPE"
    },
    "Contacts": {
      "Salutation": "STRTYPE",
      "FirstName": "STRTYPE",
      "MiddleName": "STRTYPE",
      "LastName": "STRTYPE",
      "JobTitle": "STRTYPE",
      "AdditionalContactRef": {
        "ContactName": "STRTYPE",
        "ContactValue": "STRTYPE"
      }
    },
    "CustomerTypeRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "TermsRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "SalesRepRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "OpenBalance": "AMTTYPE",
    "OpenBalanceDate": "DATETYPE",
    "SalesTaxCodeRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "ItemSalesTaxRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "ResaleNumber": "STRTYPE",
    "AccountNumber": "STRTYPE",
    "CreditLimit": "AMTTYPE",
    "PreferredPaymentMethodRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "CreditCardInfo": {
      "CreditCardNumber": "STRTYPE",
      "ExpirationMonth": "INTTYPE",
      "ExpirationYear": "INTTYPE",
      "NameOnCard": "STRTYPE",
      "CreditCardAddress": "STRTYPE",
      "CreditCardPostalCode": "STRTYPE"
    },
    "JobStatus": "ENUMTYPE",
    "JobStartDate": "DATETYPE",
    "JobProjectedEndDate": "DATETYPE",
    "JobEndDate": "DATETYPE",
    "JobDesc": "STRTYPE",
    "JobTypeRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "Notes": "STRTYPE",
    "AdditionalNotes": { "Note": "STRTYPE" },
    "PreferredDeliveryMethod": "ENUMTYPE",
    "PriceLevelRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "ExternalGUID": "GUIDTYPE",
    "CurrencyRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    }
  },
  UPDATE: {
    "ListID": "IDTYPE",
    "EditSequence": "STRTYPE",
    "Name": "STRTYPE",
    "IsActive": "BOOLTYPE",
    "ClassRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "ParentRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "CompanyName": "STRTYPE",
    "Salutation": "STRTYPE",
    "FirstName": "STRTYPE",
    "MiddleName": "STRTYPE",
    "LastName": "STRTYPE",
    "JobTitle": "STRTYPE",
    "BillAddress": {
      "Addr1": "STRTYPE",
      "Addr2": "STRTYPE",
      "Addr3": "STRTYPE",
      "Addr4": "STRTYPE",
      "Addr5": "STRTYPE",
      "City": "STRTYPE",
      "State": "STRTYPE",
      "PostalCode": "STRTYPE",
      "Country": "STRTYPE",
      "Note": "STRTYPE"
    },
    "ShipAddress": {
      "Addr1": "STRTYPE",
      "Addr2": "STRTYPE",
      "Addr3": "STRTYPE",
      "Addr4": "STRTYPE",
      "Addr5": "STRTYPE",
      "City": "STRTYPE",
      "State": "STRTYPE",
      "PostalCode": "STRTYPE",
      "Country": "STRTYPE",
      "Note": "STRTYPE"
    },
    "ShipToAddress": {
      "Name": "STRTYPE",
      "Addr1": "STRTYPE",
      "Addr2": "STRTYPE",
      "Addr3": "STRTYPE",
      "Addr4": "STRTYPE",
      "Addr5": "STRTYPE",
      "City": "STRTYPE",
      "State": "STRTYPE",
      "PostalCode": "STRTYPE",
      "Country": "STRTYPE",
      "Note": "STRTYPE",
      "DefaultShipTo": "BOOLTYPE"
    },
    "Phone": "STRTYPE",
    "AltPhone": "STRTYPE",
    "Fax": "STRTYPE",
    "Email": "STRTYPE",
    "Cc": "STRTYPE",
    "Contact": "STRTYPE",
    "AltContact": "STRTYPE",
    "AdditionalContactRef": {
      "ContactName": "STRTYPE",
      "ContactValue": "STRTYPE"
    },
    "ContactsMod": {
      "ListID": "IDTYPE",
      "EditSequence": "STRTYPE",
      "Salutation": "STRTYPE",
      "FirstName": "STRTYPE",
      "MiddleName": "STRTYPE",
      "LastName": "STRTYPE",
      "JobTitle": "STRTYPE",
      "AdditionalContactRef": {
        "ContactName": "STRTYPE",
        "ContactValue": "STRTYPE"
      }
    },
    "CustomerTypeRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "TermsRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "SalesRepRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "SalesTaxCodeRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "ItemSalesTaxRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "ResaleNumber": "STRTYPE",
    "AccountNumber": "STRTYPE",
    "CreditLimit": "AMTTYPE",
    "PreferredPaymentMethodRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "CreditCardInfo": {
      "CreditCardNumber": "STRTYPE",
      "ExpirationMonth": "INTTYPE",
      "ExpirationYear": "INTTYPE",
      "NameOnCard": "STRTYPE",
      "CreditCardAddress": "STRTYPE",
      "CreditCardPostalCode": "STRTYPE"
    },
    "JobStatus": "ENUMTYPE",
    "JobStartDate": "DATETYPE",
    "JobProjectedEndDate": "DATETYPE",
    "JobEndDate": "DATETYPE",
    "JobDesc": "STRTYPE",
    "JobTypeRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "Notes": "STRTYPE",
    "AdditionalNotesMod": {
      "NoteID": "INTTYPE",
      "Note": "STRTYPE"
    },
    "PreferredDeliveryMethod": "ENUMTYPE",
    "PriceLevelRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    },
    "CurrencyRef": {
      "ListID": "IDTYPE",
      "FullName": "STRTYPE"
    }
  }
};