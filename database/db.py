from elasticsearch import (
    Elasticsearch
)


class ElasticsearchConnector:

    def __init__(self):

        self.client = Elasticsearch(
            "http://localhost:9200"
        )

        self.index_name = (
            "mini_siem_alerts"
        )

    def store_alert(
        self,
        alert
    ):

        response = self.client.index(

            index=self.index_name,

            document=alert
        )

        return response

    def search_alerts(
        self,
        query
    ):

        response = self.client.search(

            index=self.index_name,

            query=query
        )

        return response
