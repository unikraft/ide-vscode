if [ $# -eq 6 ]; then
    echo "Setup bridge $2"
    sudo brctl addbr $2
    sudo ip a a $3/$4 dev $2
    sudo ip l set dev $2 up
fi

if [ $# -eq 1 ]; then
    echo "Executing kraft run $1"
    kraft run $1
fi

if [ $# -ne 1 ]; then
    echo "Executing kraft run $1 -b $2 \"netdev.ipv4_addr=$5 netdev.ipv4_gw_addr=$3 netdev.ipv4_subnet_mask=$4 -- \""
    kraft run $1 -b $2 "netdev.ipv4_addr=$5 netdev.ipv4_gw_addr=$3 netdev.ipv4_subnet_mask=$4 -- "
fi

echo "Done executing kraft run"

if [ $# -eq 6 ]; then
    echo "Cleanup bridge $2"
    sudo ip l set dev $2 down
    sudo brctl delbr $2
fi

sleep 20
