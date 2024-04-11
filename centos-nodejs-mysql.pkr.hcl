packer {
  required_plugins {
    googlecompute = {
      source  = "github.com/hashicorp/googlecompute"
      version = "~> 1"
    }
  }
}

source "googlecompute" "centos" {
  project_id   = "tribal-affinity-414200"
  source_image = "centos-stream-8-v20240110"
  ssh_username = "packer"
  zone         = "us-west2-a"
}

build {
  sources = [
    "source.googlecompute.centos"
  ]

  provisioner "shell" {
    inline = [
      "sudo dnf module -y enable nodejs:18",
      "sudo dnf install -y nodejs",
      // "sudo dnf install -y mysql-server",
      "sudo groupadd csye6225",
      "sudo useradd -r -g csye6225 -s /usr/sbin/nologin csye6225",
      // "sudo systemctl start mysqld",
      // "sudo systemctl enable mysqld",
      // "sudo mysqladmin -u root password 'root'",
      // "sudo mysql -u root -p'root' -e 'CREATE DATABASE IF NOT EXISTS test_db;'",
      "sudo mkdir -p /home/csye6225",
      "curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh",
      "sudo bash add-google-cloud-ops-agent-repo.sh --also-install"
    ]
  }

  provisioner "file" {
    source      = "webapp"
    destination = "/tmp/"
  }

  provisioner "file" {
    source      = "ops-agent-config.yaml"
    destination = "/tmp/ops-agent-config.yaml"
  }

  provisioner "shell" {
    inline = [
      "sudo mv /tmp/ops-agent-config.yaml /etc/google-cloud-ops-agent/config.yaml",
      "sudo systemctl restart google-cloud-ops-agent",
      "sudo mv /tmp/webapp /home/csye6225/",
      "sudo chown -R csye6225:csye6225 /home/csye6225",
      "sudo -u csye6225 bash -c 'cd /home/csye6225/webapp && npm install'"
    ]
  }

  provisioner "file" {
    source      = "webapp.service"
    destination = "/tmp/webapp.service"
  }

  provisioner "shell" {
    inline = [
      "sudo mv /tmp/webapp.service /etc/systemd/system/webapp.service",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable webapp"
    ]
  }

  post-processor "manifest" {
    output     = "packer_manifest.json"
    strip_path = true
  }
}
