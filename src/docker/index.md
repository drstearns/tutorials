To deploy a web server, you need to get your application on to a computer that is connected to the Internet with a stable IP address. In the bad old days of the Web, this was done by renting rack space in a data center and installing your own gear. Since you were buying your own computers, you had to guess how much computing power, memory, and disk storage you might need. If you got it wrong, your computers would either sit idle most of the time, or struggle to keep up with the load. And even if you got it right, you had to buy enough equipment to handle your peak load, even if that occurred for only a few minutes each day.

Starting in the 2000s, several hosting companies developed more flexible alternatives based on **virtual machines (VMs)**. One physical machine could host several VMs, sharing its CPU, memory, storage, and I/O devices via a [hypervisor](https://en.wikipedia.org/wiki/Hypervisor). A virtual machine is like a computer running within another computer. To the developer, each VM felt like a real independent computer; it had a full copy of the operating system, application software, and any other supporting files your server needed, and it was isolated from the other VMs running on the same physical machine. But since they were virtual, you could spin-up a new VM within a few minutes, and spin it back down again when it was no longer needed. New VMs could be allocated to any physical machine, so hosting companies were able to more fully utilize their hardware.

As desktop and laptop machines became more powerful, developers realized they could use this same technique to create consistent, isolated development environments on their own computers. Tools like [Vagrant](https://www.vagrantup.com/) made it easy for every developer on the team to spin-up the same Linux VM, with the same compiler and database versions, regardless of which host OS they happened to use. VMs also made it easy to work on multiple projects with conflicting dependencies, as the VMs provided separate isolated environments: if one project required version 1 of some server, but another required version 2, you could easily switch between them by spinning down one VM and spinning up another. And since the developers were now working in the same environment as their target production servers, there were less unexpected failures when rolling out new versions.

This all worked well, but there were a lot of inefficiencies. VMs are quite heavy-weight: each VM includes a full copy of the entire operating system (OS), so the OS is duplicated in memory for each VM, even if all the VMs use the same OS. Spinning up a VM also requires a full operating system startup sequence, which can take a few minutes.

During the 2000s, several features were added to the Linux kernel that provided similar levels of isolation for multiple _applications_ running on the _same operating system_. These features enable multiple isolated "containers" within a single OS, each of which has a separate file system, process group, and network stack, just like a VM. But unlike VMs, these containers share the underlying OS, so they have a much smaller memory footprint, and can start/stop almost instantly.

These new kernel features were complex and difficult to use, so in 2013 a new company named Docker released a set of command-line tools that made it easier to build, run, and manage these containers. Docker became very popular, very quickly, and is now commonly used not only for deployment, but also for running any sort of server software on a development machine.

## What is Docker?

At its core, Docker is a technology for running application software in isolated, secure, and reusable containers. A container is like a VM, but much lighter-weight, as it can share the underlying operating system (OS), known as the **host OS**.

![visual comparison of VMs and containers](img/container-vs-vm.png)

Docker containers are isolated from each other, as well as the host OS. Each container has its own independent file system, so it can't access the host's file system unless you explicitly allow it to do so (see the [Mounting Volumes](#secmountingvolumes) section below). Each container also has its own independent network address and stack by default, and only the ports you want accessible will be published to the host OS. The process groups are also separate and isolated so that a process in one container can't see or communicate with processes in other containers, or the host OS.

All of this isolation is good for not only handling conflicting dependencies, but also security. If a web application gets compromised, the attacker is trapped inside the container and can't do any real damage to the host OS or other containers. Any changes the attacker makes within a running container have no effect other containers started from the same image, and are erased when the current container is removed.

Docker consists of a set of command-line tools and a [daemon process](https://en.wikipedia.org/wiki/Daemon_(computing)) that runs on Linux (version 3.10 and beyond) or Windows Server (version 2016 and beyond). The tools just provide a command-line interface (CLI) to the daemon process, so all the real work happens in the daemon.

Since the daemon process requires Linux or Windows Server, using Docker on your Mac or Windows Professional development machine requires a Linux VM. In the early days of Docker you had to install this yourself, but now their native applications for Mac and Windows come with a minimal Linux VM that runs on the native hypervisor built into MacOS and Windows Pro. The command line interface (CLI) still runs on the host operating system but communicates with the daemon process running within the Linux VM.

![stack on development machine](img/dev-machine.png)

## Container Images

In addition to leveraging the underlying operating system's containerization features, Docker also defines a format for container images. A container image is like a black box that encapsulates all the software and files your application needs to run into one easily-managed unit. Container images can be uploaded to Docker's central container registry, known as [Docker Hub](https://hub.docker.com/), which is like GitHub but for Docker container images instead of git repos. Docker Hub already contains container images for all the popular open-source server software, and you can create your own account to host your own container images.

## Installing Docker


## Running Containers


### Running Detached Containers

### Publishing Ports

### Mounting Volumes

### Setting Environment Variables


## Building Containers


## Deploying Containers

