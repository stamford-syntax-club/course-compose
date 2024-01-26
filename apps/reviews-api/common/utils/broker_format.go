package utils

func FormatBrokerServers(brokersURL ...string) (brokers string) {
	for i, url := range brokersURL {
		brokers += url
		if i < len(brokersURL)-1 {
			brokers += ","
		}
	}
	return
}
