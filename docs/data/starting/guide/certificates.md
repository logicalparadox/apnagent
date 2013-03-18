---
  title: Generate Certificates
  render-file: false
  weight: 10
---

### Generate Certificates

Before using _**apn** agent_ you will need certificates to establish a secure connection with the APNs
or Feedback service. The following steps will walk you through generating these certificates in all of 
the formats that _**apn** agent_ supports. 

**1. Application:** Log in the iOS Provision Portal from the Apple Developer website. Select "App IDs" from the left
side menu, then "configure" next to the application you wish generate certificates for.

**2. Enable:** [[Screenshot]](/public/img/apnagent_certs_enable.png) If it is not already enabled, check the box 
for "Enable for Apple Push Notification server". 

**3. Configure:**  [[Screenshot]](/public/img/apnagent_certs_configure.png)
Select "Configure" for the environment you want to generate certificates for. Follow the wizard's 
instructions for generating a CSR file. Make sure to save the CSR file in a safe place so that you 
can reuse it for future certificates. 

**4. Generate:** [[Screenshot]](/public/img/apnagent_certs_generate.png)
After you have uploaded your CSR it will generate a "Apple Push Notification service SSL Certificate". 
Download it to a safe place. 

**5. Import:**  [[Screenshot]](/public/img/apnagent_certs_import.png)
Once downloaded, locate the file with Finder and double-click to import the certificate into "Keychain 
Access". Use the filters on the left to locate your newly import certificate if it is not visible. It 
will be listed under the "login" keychain in the "Certificates" category. Once located, right-click and 
select "Export". 

**6. Export:** When the export dialog appears be sure that the "File Format" is set at ".p12". Name the file according
to the environment, such as `apnagent-dev.p12` and save it to your project directory. You will then be prompted
to enter a password to secure the exported item. This is optional, however if you do specify one you will
need to configure _**apn** agent_'s classes to use that "passphrase". You will also be prompted for your login password.

**7. Convert (optional):** _**apn** agent_'s classes support ".p12" files through the `pfx` configuration options to authenticate
connections. The last step is optional but instructs on how to turn a ".p12" file into a "key" and "cert" 
pair (".pem" format).

Locate your ".p12" file in a terminal session and execute the following commands. 

```sh
openssl pkcs12 -clcerts -nokeys -out apnagent-dev-cert.pem -in apnagent-dev.p12
openssl pkcs12 -nocerts -out apnagent-dev-key.pem -in apnagent-dev.p12
```

The first will generate a ".pem" file for use as the `cert` file. The second will generate
a ".pem" file for use as the `key` file. The second requires a password be entered to secure
the key. This can be removed by executing the following command.

```sh
openssl rsa -in apnagent-dev-key.pem -out apnagent-dev-key.pem
```
