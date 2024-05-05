# packer-image

This Packer configuration is designed to automate the creation of a custom CentOS image on Google Compute Engine (GCE). This image is tailored for deploying web applications and includes necessary configurations and dependencies.

## Prerequisites

Before using this Packer configuration, ensure you have the following:

- Google Cloud Platform (GCP) Account
- Packer
- Google Cloud SDK

## Usage

### 1. Clone the Repository: 

Clone this repository to your local machine:
    
```bash
git https://github.com/Qccchen/packer-image.git
cd packer-image
```

### 2. Update Configuration: 

Modify the Packer template (template.pkr.hcl) to suit your requirements. You may need to adjust variables such as project_id, zone, and ssh_username based on your GCP setup.

### 3. Build the Image:
 
 Run Packer to build the custom CentOS image:

```bash
packer build centos-nodejs-mysql.pkr.hcl
```

### 4. Deploy the Image:

Once the image is built, it will be available in your GCP project. You can use it to create instances for deploying your web applications.

## Customization

### Provisioning: 

The Packer configuration includes shell scripts to perform provisioning tasks such as updating packages, installing Node.js, creating user groups, deploying web applications, and configuring Google Cloud Operations Agent.

### File Provisioners: 

Files required for provisioning, including web application files (webapp) and the Google Cloud Operations Agent configuration file (ops-agent-config.yaml), are included in the Packer build.

### Post-Processor: 

The configuration generates a manifest file (packer-manifest.json) after the build process.

## Contributors

Qian Chen

