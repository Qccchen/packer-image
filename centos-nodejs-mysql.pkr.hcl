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
      "sudo dnf update -y",
      "sudo dnf module -y enable nodejs:18",
      "sudo dnf install -y nodejs",
      "sudo dnf install -y mysql-server",
      "sudo systemctl start mysqld",
      "sudo systemctl enable mysqld"
    ]
  }
}
