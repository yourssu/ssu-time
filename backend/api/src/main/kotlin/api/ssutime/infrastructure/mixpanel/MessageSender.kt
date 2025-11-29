package api.ssutime.infrastructure.mixpanel

import com.mixpanel.mixpanelapi.ClientDelivery
import com.mixpanel.mixpanelapi.MessageBuilder
import com.mixpanel.mixpanelapi.MixpanelAPI
import org.json.JSONObject
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class MessageSender {

    @Value("\${mixpanel.token}")
    private lateinit var projectToken: String

    fun send(jsonMap: Map<String, String>, distinctId: String, eventName: String) {
        val messageBuilder = MessageBuilder(projectToken)

        val jsonObject = JSONObject()
        jsonMap.forEach { jsonObject.put(it.key, it.value) }
        val event = messageBuilder.event(distinctId, eventName, jsonObject)

        val delivery = ClientDelivery()
        delivery.addMessage(event)

        val api = MixpanelAPI()
        api.deliver(delivery)
    }
}