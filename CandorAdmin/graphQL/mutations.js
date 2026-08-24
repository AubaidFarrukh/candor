import { gql } from "@apollo/client";

export const USERS_GRAPH = gql`
  mutation Mutation {
    AdminUserGraph
  }
`;

export const ACTIVE_USERS_GRAPH = gql`
  mutation Mutation {
    AdminActiveUsersGraph
  }
`;

export const CONTENTS_GRAPH = gql`
  mutation Mutation {
    AdminConentCreatedGraph
  }
`;

export const SEND_NOTI = gql`
  mutation PushInAppNotification(
    $message: String!
    $broadcast: Boolean
    $ids: [String]
  ) {
    PushInAppNotification(message: $message, broadcast: $broadcast, ids: $ids) {
      _id
      message
    }
  }
`;

export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($deleteMessageId: String!) {
    DeleteMessage(id: $deleteMessageId) {
      json
      message
      status
    }
  }
`;

export const INACTIVATE_CARD = gql`
  mutation AdminDeactivateCard($adminDeactivateCardId: String!) {
    AdminDeactivateCard(id: $adminDeactivateCardId) {
      _id
    }
  }
`;
export const ACTIVATE_CARD = gql`
  mutation AdminActivateCard($adminActivateCardId: String!) {
    AdminActivateCard(id: $adminActivateCardId) {
      json
      message
      status
    }
  }
`;
export const INACTIVATE_POLL = gql`
  mutation AdminDeactivatePollCard(
    $adminDeactivatePollCardId: String!
    $inactiveReason: String
  ) {
    AdminDeactivatePollCard(
      id: $adminDeactivatePollCardId
      inactive_reason: $inactiveReason
    ) {
      _id
    }
  }
`;
export const ACTIVATE_POLL = gql`
  mutation AdminActivatePollCard($adminActivatePollCardId: String!) {
    AdminActivatePollCard(id: $adminActivatePollCardId) {
      json
      message
      status
    }
  }
`;
// export const UPDATE_POLL = gql`
// {
//   "updatePollId": null,
//   "text": null,
// }
// `;

export const A_D_USER = gql`
  mutation AdminActivateDeactivateUser(
    $adminActivateDeactivateUserId: String!
    $status: String!
  ) {
    AdminActivateDeactivateUser(
      id: $adminActivateDeactivateUserId
      status: $status
    ) {
      json
      message
      status
    }
  }
`;

export const UPDATE_CARD = gql`
  mutation AdminUpdateCard(
    $adminUpdateCardId: String!
    $backgroundColor: String
    $captionText: String
    $captionImage: String
    $description: String
    $price: Float
    $isPremium: Boolean
    $status: String
    $backgroundImage: String
    $stickerImage: String
    $textColor: String
    $responseType: String
    $gradientBackgroundColor: String
    $newTextColor: String
  ) {
    AdminUpdateCard(
      id: $adminUpdateCardId
      background_color: $backgroundColor
      caption_text: $captionText
      caption_image: $captionImage
      description: $description
      price: $price
      is_premium: $isPremium
      status: $status
      background_image: $backgroundImage
      sticker_image: $stickerImage
      text_color: $textColor
      response_type: $responseType
      gradient_background_color: $gradientBackgroundColor
      new_text_color: $newTextColor
    ) {
      _id
      gradient_background_color
      new_text_color
    }
  }
`;
export const UPDATE_POLL = gql`
  mutation UpdatePoll($updatePollId: String!, $text: String!, $status: String) {
    UpdatePoll(id: $updatePollId, text: $text, status: $status) {
      _id
    }
  }
`;

export const CREATE_CARD = gql`
  mutation CreateCard(
    $backgroundColor: String!
    $captionText: String
    $textColor: String
    $linkedPollId: String
    $stickerImage: String
    $backgroundImage: String
    $isPremium: Boolean
    $price: Float
    $category: String
    $responseType: String
    $similarQuestions: [String]
    $gradientBackgroundColor: String
    $newTextColor: String
  ) {
    CreateCard(
      background_color: $backgroundColor
      caption_text: $captionText
      text_color: $textColor
      linked_poll_id: $linkedPollId
      sticker_image: $stickerImage
      background_image: $backgroundImage
      is_premium: $isPremium
      price: $price
      category: $category
      response_type: $responseType
      similar_questions: $similarQuestions
      gradient_background_color: $gradientBackgroundColor
      new_text_color: $newTextColor
    ) {
      _id
      background_color
      text_color
      caption_text
      caption_image
      description
      price
      linked_poll {
        _id
        text
      }
      week_title
      is_activated
      creator {
        _id
        name
      }
      status
      gradient_background_color
      new_text_color
    }
  }
`;

export const ADMIN_CLEAR_PAYOUT = gql`
  mutation AdminClearRevSharePayments(
    $paidAmount: Float!
    $paymentMethod: String!
    $withrawlRequestId: String!
  ) {
    AdminClearRevSharePayments(
      paid_amount: $paidAmount
      payment_method: $paymentMethod
      withrawl_request_id: $withrawlRequestId
    ) {
      status
      message
      json
    }
  }
`;


export const ADMIN_MARK_REV_SHARE_AS_PAID = gql`
    mutation AdminMarkRevShareAsPaid(
      $id: String!
    ) {
      AdminMarkRevShareAsPaid(
        id: $id
      ) {
        status
        message
        json
      }
    }
`