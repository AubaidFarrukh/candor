import { gql } from "@apollo/client";

export const LOGIN = gql`
  query LoginUser($email: String!, $password: String!) {
    LoginUser(email: $email, password: $password) {
      _id
      auth_token
      birthday
      email
      name
      phone
      username
      is_premium
      is_snap_logged_in
      snapchat_bitmoji
    }
  }
`;

export const LIST_CARDS = gql`
  query ListCards($limit: Int, $page: Int, $category: String) {
    ListCards(limit: $limit, page: $page, category: $category) {
      _id
      background_color
      caption_text
      caption_image
      description
      is_activated
      text_color
      background_image
      sticker_image
      is_premium
      isPurchased
      price
      new_text_color
      gradient_background_color
      category
      creator {
        name
      }
      response_type
    }
  }
`;

export const LIST_MESSAGES = gql`
  query ListMessages($limit: Int, $page: Int) {
    ListMessages(limit: $limit, page: $page) {
      _id
      answer_text
      approx_location
      browser_name
      country_name
      hints
      ip_address
      network_provider
      profile_link
      question
      temporary_sender_user_id
      is_read
      is_replied
      isPaid
      card {
        _id
        background_color
        text_color
        response_type
      }
      answer_picture
      answer_audio
      additional_audio
    }
  }
`;

export const LIST_CARDS_MESSAGES = gql`
  query ListCards($limit: Int, $page: Int) {
    ListCards(limit: $limit, page: $page) {
      _id
      background_color
      caption_text
      caption_image
      description
      is_activated
      text_color
    }
    ListMessages(limit: $limit, page: $page) {
      _id
      answer_text
      approx_location
      browser_name
      country_name
      hints
      ip_address
      network_provider
      profile_link
      question
      temporary_sender_user_id
      is_read
      is_replied
      isPaid
    }
  }
`;

export const LIST_POLLS = gql`
  query ListPolls($page: Int, $type: String, $limit: Int, $weekName: String) {
    ListPolls(page: $page, type: $type, limit: $limit, week_name: $weekName) {
      isCardLive
      brag_name
      is_paid
      is_selected
      status
      Card {
        _id
      }
      inactive_reason
      _id
      isVoted
      submitted_by {
        name
      }
      text
      total_votes
      week {
        current_time
        expiry_time
        name
      }
      week_title
    }
  }
`;

export const GET_CURRENT_WEEK = gql`
  query CurrentWeek {
    CurrentWeek {
      current_time
      expiry_time
      name
    }
  }
`;

export const GET_POLL_WEEKLY_STATS = gql`
  query PollsWeeklyStats($limit: Int, $page: Int) {
    PollsWeeklyStats(limit: $limit, page: $page) {
      brag_name
      isVoted
      is_paid
      is_selected
      status
      text
      total_votes
      week_title
      submitted_by {
        name
      }
    }
  }
`;

export const CHECK_IF_USER_IS_PREMIUM = gql`
  query User($userId: String!) {
    User(id: $userId) {
      is_premium
      was_premium
      is_donated
    }
  }
`;

export const GET_UNREAD_MESSAGES_COUNT = gql`
  query RootQuery {
    TotalUnreadDMMessagesCount
    UnreadMessageCount
    TotalUnreadGroupMessagesCount
  }
`;

export const GET_USER_REV_SHARE = gql`
  query User($userId: String!) {
    User(id: $userId) {
      pending_earnings
    }
  }
`;

export const GET_BLANK_CARD_AVAILABILITY = gql`
  query User($userId: String!) {
    User(id: $userId) {
      is_blank_audio_card_enabled
      is_blank_text_card_enabled
    }
  }
`;

export const CHECK_IF_IS_SNAPCHAT_LOGGEDIN = gql`
  query User($userId: String!) {
    User(id: $userId) {
      snapchat_name
      snapchat_bitmoji
      is_snap_logged_in
    }
  }
`;

export const LIST_CHATS = gql`
  query RootQuery($limit: Int, $page: Int) {
    ListDMChatThreads(limit: $limit, page: $page)
  }
`;

export const LIST_CHAT_MESSAGES = gql`
  query ListMessagesFromDMThread(
    $anonymousUserId: String!
    $limit: Int
    $page: Int
    $msgToken: String!
  ) {
    ListMessagesFromDMThread(
      anonymous_user_id: $anonymousUserId
      limit: $limit
      page: $page
      msg_token: $msgToken
    ) {
      created_at
      message
      sender_id
      receiver_id
    }
  }
`;

export const GET_PRESIGNED_URL = gql`
  query GetS3PreSignedUrls($fileNames: [String!]) {
    GetS3PreSignedUrls(fileNames: $fileNames) {
      urls {
        file
        key
        put
        get
        delete
      }
    }
  }
`;

export const LIST_DM_LINKS = gql`
  query ListDMLinks($limit: Int, $page: Int) {
    ListDMLinks(limit: $limit, page: $page) {
      status
      json
      message
    }
  }
`;

export const GET_CURRENT_VERSION_OF_APP = gql`
  query RootQuery {
    GetCurrentVersionOfApp {
      status
      message
      json
    }
  }
`;

export const GET_USER_GROUPS = gql`
  query GetUserGroups($limit: Int, $page: Int) {
    GetUserGroups(limit: $limit, page: $page) {
      _id
      group_name
      group_token
      unread_messages
      created_at
      responses
    }
  }
`;

export const GET_GROUP_MESSAGES = gql`
  query GetGroupMessages($groupToken: String!, $limit: Int, $page: Int) {
    GetGroupMessages(group_token: $groupToken, limit: $limit, page: $page) {
      taggedMessage {
        message
        sender {
          name
        }
      }
      group_token
      message
      created_at
      _id
      sender {
        _id
        group_token
        user
        emoji
        name
      }
    }
  }
`;
