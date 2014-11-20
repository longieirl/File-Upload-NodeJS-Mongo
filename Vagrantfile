$setup = <<SCRIPT

echo "Stopping and removing existing containers"
#stop and remove any existing containers
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)

echo "Building from Dockerfiles"
# Build containers from Dockerfiles
docker build -t sapvagrant/mongodb /var/local/pocosdrive/dockerMongo

echo "Running & linking containers"
# Run and link the containers
docker run -d -P -p 27017:27017 -p 28017:28017 --name mongodb sapvagrant/mongodb

SCRIPT

# Commands required to ensure correct docker containers
# are started when the vm is rebooted.
$start = <<SCRIPT
docker start mongodb
SCRIPT

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure("2") do |config|

# Require a recent version of vagrant otherwise some have reported errors setting host names on boxes
Vagrant.require_version ">= 1.6.5"

	# Expose Mongodb database settings
    config.vm.network "forwarded_port", guest: 27017, host: 27017
    config.vm.network "forwarded_port", guest: 28017, host: 28017
  
    # Ubuntu
    config.vm.box = "precise64"
    config.vm.box_url="http://files.vagrantup.com/precise64.box"

    # Install latest docker
    config.vm.provision "docker"

    config.vm.synced_folder ".", "/var/local/pocosdrive" #, type: "nfs"

    # Setup the containers when the VM is first created
    # Note: Windows OS complains about resolving host files, add 'run: "always"' to this line rather than destroying the VM image
    config.vm.provision "shell", inline: $setup

    # Make sure the correct containers are running
    # every time we start the VM.
    config.vm.provision "shell", run: "always", inline: $start

end