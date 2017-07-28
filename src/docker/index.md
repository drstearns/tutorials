To deploy a web server, you need to get your application on to a computer that is connected to the Internet with a stable IP address. In the bad old days of the Web, this was done by renting rack space in a data center and installing your own gear. Since you were buying your own computers, you had to guess how much computing power, memory, and disk storage you might need. If you got it wrong, your computers would either sit mostly idle or struggle to keep up with the load. And even if you got it right, you had to buy enough equipment to handle your peak load, even if that occurred for only a few minutes each day.

Starting in the 2000s, several hosting companies developed more flexible alternatives based on "virtual machines" (VMs). One physical machine could host several VMs, sharing its CPU, memory, and I/O devices via a [hypervisor](https://en.wikipedia.org/wiki/Hypervisor). Each VM had a full copy of the operating system, application software, and any other supporting files your server needed, so it was more or less isolated from the other VMs running on the same physical machine. But since they were virtual, you could spin-up a new VM within a few minutes, and spin it back down again when it was no longer needed. New VMs could be allocated to any physical machine, so hosting companies were able to more fully utilize their hardware.

As desktop and laptop machines became more powerful, developers started to realize they could use this same technique to create consistent, isolated development environments on their computers. Tools like [Vagrant](https://www.vagrantup.com/) made it easy for every developer on the team to spin-up the same Linux VM, with the same language compiler and database server, regardless of which host OS they happened to use. VMs also made it easy to work on multiple projects with conflicting dependencies, as the VMs provided separate and isolated environments. And since the developers were now working in the same environment as their production servers, there were less unexpected failures when rolling out new versions.

This all worked well, but VMs are quite heavy-weight: each VM includes a full copy of the entire operating system (OS) and supporting libraries, so the OS is duplicated in memory for each VM, even if all the VMs on the same physical machine use the same OS. Spinning up a VM also requires a full operating system startup sequence, which can take a few minutes.

During the 2000s, several features were added to the Linux kernel that provided similar levels of isolation for multiple _applications_ running on the _same operating system_. These features enable multiple isolated "containers" within a single OS that have separate file systems, process groups, and network stacks, just like VMs. But unlike VMs, these containers share the underlying OS, so they have a much smaller memory footprint, and can start/stop almost instantly.

These new kernel features were complex and difficult to use, so in 2013 a new company named Docker released a set of command-line tools that made it easier to build, run, and manage these containers. Docker grew in popularity very quickly, and is now commonly used not only for deployment, but also for running any sort of server software on development machines.

## What is Docker?

At its core, Docker is a technology for running software in isolated, secure, and reusable containers. Think of a container as an isolated, easy-to-manage black box that encapsulates all of the software and files needed for an application. Docker makes it easy to build these container images, and run multiple copies of them.



It consists of a set of command-line tools and a daemon process that manages running containers. 




![visual comparison of VMs and containers](img/container-vs-vm.png)





## Why Use It?



## Installing Docker


## Running Containers


### Running Detached Containers

### Publishing Ports

### Mounting Volumes

### Setting Environment Variables


## Building Containers


## Deploying Containers

